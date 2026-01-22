# 🚀 Guide de Démarrage Rapide - Sondage Mata

## Installation Express (Windows)

### Étape 1: Installer PostgreSQL

1. **Télécharger PostgreSQL**
   - Allez sur https://www.postgresql.org/download/windows/
   - Téléchargez PostgreSQL 15 ou plus récent
   - Installez avec les options par défaut
   - **NOTEZ bien votre mot de passe PostgreSQL!**

2. **Vérifier l'installation**
   ```cmd
   psql --version
   ```

### Étape 2: Installer Node.js

1. **Télécharger Node.js**
   - Allez sur https://nodejs.org/
   - Téléchargez la version LTS (recommandée)
   - Installez avec les options par défaut

2. **Vérifier l'installation**
   ```cmd
   node --version
   npm --version
   ```

### Étape 3: Installer le projet

1. **Lancer le script d'installation**
   
   Double-cliquez sur `install.bat` ou exécutez dans CMD:
   ```cmd
   install.bat
   ```

   Ce script va:
   - ✓ Vérifier Node.js et PostgreSQL
   - ✓ Installer les dépendances npm
   - ✓ Créer le fichier .env

2. **Configurer le fichier .env**
   
   Le fichier `.env` s'ouvrira automatiquement. Modifiez:
   ```env
   DB_PASSWORD=votre_vrai_mot_de_passe_postgresql
   ```

### Étape 4: Configurer la base de données

1. **Option A - Script automatique (recommandé)**
   
   Allez dans le dossier database et exécutez:
   ```cmd
   cd database
   setup.bat
   ```

2. **Option B - Manuel**
   
   Ouvrez PowerShell ou CMD et exécutez:
   ```cmd
   psql -U postgres
   ```
   
   Puis dans psql:
   ```sql
   CREATE DATABASE maas_db;
   \c maas_db
   \i C:/Mata/Sondage/database/init.sql
   \q
   ```

### Étape 5: Démarrer le serveur

Double-cliquez sur `start.bat` ou exécutez:
```cmd
start.bat
```

Ou directement:
```cmd
npm start
```

### Étape 6: Accéder au formulaire

Ouvrez votre navigateur et allez sur:
```
http://localhost:3000
```

Pour l'administration (voir les résultats):
```
http://localhost:3000/admin.html
```

---

## 📋 Commandes Utiles

### Gestion du serveur
```cmd
# Démarrer
npm start

# Arrêter
Ctrl + C dans la console
```

### Base de données
```cmd
# Se connecter à PostgreSQL
psql -U postgres -d maas_db

# Voir les tables
\dt

# Voir toutes les réponses
SELECT * FROM reponses_sondage;

# Voir les statistiques
SELECT * FROM statistiques_sondage;

# Compter les réponses
SELECT COUNT(*) FROM reponses_sondage;

# Quitter
\q
```

### Exporter les données
```cmd
# Via navigateur
http://localhost:3000/api/export/csv

# Via psql
psql -U postgres -d maas_db -c "COPY reponses_sondage TO 'C:/export.csv' CSV HEADER;"
```

---

## 🌐 Partager avec vos investisseurs

### Option 1: Réseau Local

1. **Trouver votre IP locale**
   ```cmd
   ipconfig
   ```
   Notez votre "Adresse IPv4" (ex: 192.168.1.100)

2. **Ouvrir le port dans le pare-feu Windows**
   - Panneau de configuration → Pare-feu Windows
   - Paramètres avancés → Règles de trafic entrant
   - Nouvelle règle → Port → TCP → 3000
   - Autoriser la connexion

3. **Partager l'URL**
   ```
   http://192.168.1.100:3000
   ```

### Option 2: Déploiement en ligne (Recommandé)

#### A. Avec Render.com (GRATUIT)

1. Créez un compte sur https://render.com
2. Connectez votre dépôt GitHub
3. Créez un nouveau "Web Service"
4. Ajoutez une base PostgreSQL
5. Configurez les variables d'environnement
6. Déployez!

Votre URL sera: `https://votre-app.onrender.com`

#### B. Avec Railway.app (GRATUIT)

1. Créez un compte sur https://railway.app
2. New Project → Deploy from GitHub
3. Add PostgreSQL
4. Configure les variables d'environnement
5. Deploy!

---

## 🔧 Résolution de Problèmes

### Erreur: "Cannot connect to PostgreSQL"

**Solutions:**
1. Vérifiez que PostgreSQL est démarré:
   - Services Windows → PostgreSQL → Démarrer
2. Vérifiez le mot de passe dans `.env`
3. Vérifiez le port (5432 par défaut)

### Erreur: "Port 3000 already in use"

**Solutions:**
1. Changez le port dans `.env`:
   ```env
   PORT=8080
   ```
2. Ou arrêtez le processus utilisant le port 3000:
   ```cmd
   netstat -ano | findstr :3000
   taskkill /PID [numéro_PID] /F
   ```

### Erreur: "Module not found"

**Solution:**
```cmd
npm install
```

### La base de données existe déjà

**Si vous voulez la réinitialiser:**
```sql
psql -U postgres
DROP DATABASE maas_db;
CREATE DATABASE maas_db;
\c maas_db
\i C:/Mata/Sondage/database/init.sql
```

---

## 📊 Analyser les Résultats

### Dashboard Web
```
http://localhost:3000/admin.html
```

### API Statistiques
```
http://localhost:3000/api/stats
```

### Exporter en CSV
```
http://localhost:3000/api/export/csv
```

### Requêtes SQL Utiles

```sql
-- Top 3 objectifs
SELECT objectif_principal, COUNT(*) as total
FROM reponses_sondage
GROUP BY objectif_principal
ORDER BY total DESC
LIMIT 3;

-- Délai moyen accepté
SELECT delai_attente, COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reponses_sondage) as pourcentage
FROM reponses_sondage
GROUP BY delai_attente
ORDER BY pourcentage DESC;

-- Taux de réinvestissement
SELECT 
    reinvestir,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reponses_sondage), 2) as pourcentage
FROM reponses_sondage
GROUP BY reinvestir;

-- Analyse temporelle
SELECT 
    DATE(date_soumission) as jour,
    COUNT(*) as reponses
FROM reponses_sondage
GROUP BY jour
ORDER BY jour DESC;
```

---

## 🔐 Sécurité pour la Production

### 1. Activer HTTPS

Utilisez un service avec SSL automatique (Render, Railway, Heroku)

### 2. Protéger les endpoints admin

Ajoutez dans `.env`:
```env
ADMIN_TOKEN=votre_token_secret_super_complexe_123456
```

Puis modifiez `server.js` pour ajouter l'authentification.

### 3. Limiter les soumissions

Ajoutez un rate limiting pour éviter le spam.

### 4. Sauvegarder la base

```cmd
# Backup complet
pg_dump -U postgres maas_db > backup_YYYY-MM-DD.sql

# Restaurer
psql -U postgres -d maas_db < backup_YYYY-MM-DD.sql
```

---

## 📞 Support

### Logs du serveur
Les logs s'affichent dans la console où vous avez lancé `npm start`

### Logs PostgreSQL
Localisation: `C:\Program Files\PostgreSQL\15\data\log\`

### Vérifier le statut
```
http://localhost:3000/api/health
```

---

## ✅ Checklist de Mise en Production

- [ ] PostgreSQL installé et configuré
- [ ] Base de données créée et schéma exécuté
- [ ] Fichier .env configuré
- [ ] Serveur démarre sans erreur
- [ ] Formulaire accessible sur localhost
- [ ] Test de soumission réussi
- [ ] Données visibles dans admin.html
- [ ] Export CSV fonctionne
- [ ] (Production) Déployé en ligne
- [ ] (Production) HTTPS activé
- [ ] (Production) Endpoints admin protégés
- [ ] (Production) Backup configuré

---

**Dernière mise à jour:** 23/01/2026  
**Version:** 1.0.0

