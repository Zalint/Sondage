# Sondage Investisseurs Mata - Stratégie 2026

Formulaire de sondage web pour recueillir les attentes des investisseurs dans le cadre de la préparation de la stratégie 2026 de Mata.

## 🎯 Objectif

Ce sondage vise à mieux comprendre les attentes des investisseurs (horizon, motivation, conditions de sortie, niveau de confiance) pour orienter la stratégie 2026 (priorités, calendrier, niveau de réinvestissement, distribution éventuelle, modalités de liquidité).

## 🛠️ Technologies utilisées

- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Backend**: Node.js, Express.js
- **Base de données**: PostgreSQL
- **Dépendances**: 
  - `express` - Framework web
  - `pg` - Client PostgreSQL
  - `cors` - Gestion CORS
  - `dotenv` - Variables d'environnement

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [PostgreSQL](https://www.postgresql.org/) (version 12 ou supérieure)
- Un gestionnaire de paquets Node.js (npm vient avec Node.js)

## 🚀 Installation

### 1. Cloner ou télécharger le projet

```bash
cd C:\Mata\Sondage
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données PostgreSQL

#### 3.1. Créer la base de données

Connectez-vous à PostgreSQL et créez la base de données :

```sql
-- Sous Windows PowerShell ou CMD
psql -U postgres

-- Dans psql
CREATE DATABASE maas_db;
\c maas_db
```

#### 3.2. Exécuter le schéma de base de données

```bash
# Sous Windows PowerShell ou CMD
psql -U postgres -d maas_db -f database/schema.sql
```

Ou depuis psql :

```sql
\c maas_db
\i database/schema.sql
```

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Configuration de la base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maas_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgresql

# Port du serveur
PORT=3000

# Environnement
NODE_ENV=production
```

**Important** : Remplacez `votre_mot_de_passe_postgresql` par votre mot de passe PostgreSQL réel.

### 5. Démarrer le serveur

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000` (ou le port spécifié dans `.env`).

## 📱 Utilisation

### Accéder au formulaire

Ouvrez votre navigateur et accédez à :

```
http://localhost:3000
```

### Partager avec les investisseurs

Pour rendre le formulaire accessible à vos investisseurs, vous devez :

1. **Option 1 - Déploiement local (réseau local)**
   - Trouvez votre adresse IP locale : `ipconfig` (Windows)
   - Partagez l'URL : `http://[VOTRE_IP]:3000`
   - Assurez-vous que le port 3000 est ouvert sur votre pare-feu

2. **Option 2 - Déploiement en ligne (recommandé)**
   - Déployez sur des services comme :
     - [Heroku](https://www.heroku.com/)
     - [DigitalOcean](https://www.digitalocean.com/)
     - [Railway](https://railway.app/)
     - [Render](https://render.com/)
   - Configurez PostgreSQL sur le service choisi
   - Mettez à jour les variables d'environnement

## 🔧 API Endpoints

Le serveur expose plusieurs endpoints :

### Endpoints publics

- `GET /` - Affiche le formulaire
- `POST /api/sondage` - Soumet une réponse au sondage
- `GET /api/health` - Vérifie le statut du serveur

### Endpoints d'administration

- `GET /api/stats` - Statistiques du sondage
- `GET /api/reponses` - Liste des réponses (pagination)
  - Paramètres : `?limit=100&offset=0`
- `GET /api/export/csv` - Exporte toutes les réponses en CSV

### Exemple d'utilisation de l'API

```javascript
// Soumettre une réponse
const reponse = {
  nom: "Jean Dupont",
  email: "jean@example.com",
  objectif_principal: "Gagner des dividendes",
  delai_attente: "2 ans",
  revente_plus_value: "Oui",
  reinvestir: "Oui",
  critere_determinant: "Le projet / la vision / l'impact",
  priorite_2026: "Mix équilibré",
  niveau_reporting: "Trimestriel (bilan + actions)"
};

fetch('http://localhost:3000/api/sondage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reponse)
})
.then(res => res.json())
.then(data => console.log(data));
```

## 📊 Consultation des résultats

### Voir les statistiques

```
http://localhost:3000/api/stats
```

### Exporter les données en CSV

```
http://localhost:3000/api/export/csv
```

Le fichier CSV sera téléchargé avec toutes les réponses au format :
- `sondage_mata_YYYY-MM-DD.csv`

### Requêtes SQL directes

Vous pouvez aussi consulter directement la base de données :

```sql
-- Connexion à la base
psql -U postgres -d maas_db

-- Voir toutes les réponses
SELECT * FROM reponses_sondage ORDER BY date_soumission DESC;

-- Voir les statistiques
SELECT * FROM statistiques_sondage;

-- Compter les réponses par objectif
SELECT objectif_principal, COUNT(*) 
FROM reponses_sondage 
GROUP BY objectif_principal;

-- Compter les réponses par délai d'attente
SELECT delai_attente, COUNT(*) 
FROM reponses_sondage 
GROUP BY delai_attente
ORDER BY COUNT(*) DESC;
```

## 📁 Structure du projet

```
Sondage/
├── database/
│   └── schema.sql              # Schéma de base de données
├── public/
│   ├── index.html              # Formulaire HTML
│   ├── styles.css              # Styles CSS
│   └── script.js               # JavaScript frontend
├── server.js                   # Serveur Express
├── package.json                # Dépendances Node.js
├── .env                        # Configuration (à créer)
├── .gitignore                  # Fichiers à ignorer par Git
└── README.md                   # Ce fichier
```

## 🎨 Personnalisation

### Modifier les couleurs

Éditez les variables CSS dans `public/styles.css` :

```css
:root {
    --primary-color: #2563eb;      /* Couleur principale */
    --primary-dark: #1d4ed8;       /* Couleur principale foncée */
    --success-color: #10b981;      /* Couleur de succès */
    --error-color: #ef4444;        /* Couleur d'erreur */
}
```

### Modifier le port du serveur

Éditez le fichier `.env` :

```env
PORT=8080
```

## 🔒 Sécurité

### Recommandations de production

1. **Utilisez HTTPS** : Déployez avec un certificat SSL/TLS
2. **Protégez les endpoints d'administration** : Ajoutez une authentification
3. **Limitez les requêtes** : Implémentez un rate limiting
4. **Validez les données** : Les validations de base sont en place, mais ajoutez-en plus si nécessaire
5. **Sauvegardez la base de données** : Mettez en place des sauvegardes régulières

### Ajouter une authentification pour les endpoints admin

Modifiez `server.js` pour protéger les routes `/api/stats`, `/api/reponses`, et `/api/export/csv` :

```javascript
// Middleware d'authentification simple
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.ADMIN_TOKEN || 'votre_token_secret';
    
    if (authHeader === `Bearer ${expectedToken}`) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Non autorisé' });
    }
};

// Appliquer le middleware
app.get('/api/stats', authMiddleware, async (req, res) => { ... });
```

## 🐛 Dépannage

### Erreur de connexion PostgreSQL

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions** :
- Vérifiez que PostgreSQL est démarré
- Vérifiez les paramètres de connexion dans `.env`
- Vérifiez que le port 5432 n'est pas bloqué

### Port déjà utilisé

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions** :
- Changez le port dans `.env`
- Ou arrêtez le processus utilisant le port 3000

### Erreur "Cannot find module"

```
Error: Cannot find module 'express'
```

**Solution** :
```bash
npm install
```

## 📞 Support

Pour toute question ou problème :
- Vérifiez les logs du serveur dans la console
- Vérifiez les logs PostgreSQL
- Consultez la documentation PostgreSQL et Express.js

## 📝 Licence

© 2026 Mata - Tous droits réservés. Confidentiel.

---

**Date de création** : 23/01/2026  
**Version** : 1.0.0

