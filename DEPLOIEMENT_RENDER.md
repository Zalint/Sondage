# 🚀 Guide de Déploiement sur Render.com

## Problème actuel : Erreur 502 Bad Gateway

L'erreur 502 indique que le serveur backend n'est pas correctement démarré ou configuré sur Render.

## ✅ Checklist de Déploiement

### 1. Créer le Web Service sur Render

1. Allez sur https://dashboard.render.com
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre dépôt GitHub : `https://github.com/Zalint/Sondage`

### 2. Configuration du Web Service

**Build & Deploy Settings:**
```
Name: mata-sondage
Region: Frankfurt (EU Central) ou le plus proche
Branch: main
Root Directory: (laissez vide)
Runtime: Node
Build Command: npm install
Start Command: node server.js
```

**Instance Type:**
- Sélectionnez **"Free"** pour commencer

### 3. Créer la Base de Données PostgreSQL

1. Dans le dashboard Render, cliquez sur **"New +"** → **"PostgreSQL"**
2. Configurez :
   ```
   Name: maas-db
   Database: maas_db
   User: postgres (ou autre)
   Region: Frankfurt (EU Central) - même région que le web service
   PostgreSQL Version: 15 ou 16
   ```
3. Sélectionnez **"Free"** instance
4. Cliquez sur **"Create Database"**

### 4. Initialiser la Base de Données

Une fois la base créée, vous devez exécuter le schéma :

1. Dans le dashboard de la base de données, allez dans l'onglet **"Shell"** ou **"Connect"**
2. Copiez la **Internal Database URL** (commence par `postgresql://`)
3. Utilisez un client PostgreSQL (comme pgAdmin ou psql) pour vous connecter :
   ```bash
   psql [INTERNAL_DATABASE_URL]
   ```
4. Exécutez le contenu du fichier `database/init.sql` :
   ```sql
   -- Copiez tout le contenu de database/init.sql et exécutez-le
   ```

**Alternative rapide :**
Vous pouvez utiliser la commande suivante depuis votre machine locale :
```bash
psql [INTERNAL_DATABASE_URL] < database/init.sql
```

### 5. Configurer les Variables d'Environnement

Dans les **Environment Variables** de votre Web Service Render :

```env
DB_HOST=dpg-xxxxx-xxxx.frankfurt-postgres.render.com
DB_PORT=5432
DB_NAME=maas_db
DB_USER=postgres
DB_PASSWORD=[mot_de_passe_généré_par_render]
NODE_ENV=production
PORT=10000
```

**Important :**
- Utilisez l'**Internal Database URL** fournie par Render
- Le PORT doit être 10000 (ou laissez Render le définir automatiquement)
- Copiez le mot de passe exact depuis les détails de votre base de données

**Alternative simple - Utiliser DATABASE_URL :**

Render fournit automatiquement `DATABASE_URL`. Vous pouvez modifier `server.js` pour l'utiliser directement :

```javascript
// Dans server.js, remplacez la configuration du pool par :
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### 6. Vérifier le Déploiement

1. **Logs** : Consultez les logs dans l'onglet "Logs" de Render
2. Recherchez les messages :
   ```
   ✓ Connexion à PostgreSQL établie
   ✓ Serveur démarré sur http://...
   ```
3. Si vous voyez des erreurs de connexion DB, vérifiez vos variables d'environnement

### 7. Tester l'API

Une fois déployé, testez ces endpoints :

```bash
# Health check
curl https://matasondage.onrender.com/api/health

# Stats (devrait retourner des zéros si pas de données)
curl https://matasondage.onrender.com/api/stats
```

## 🔧 Résolution des Problèmes Courants

### Erreur 502 Bad Gateway

**Causes possibles :**
1. ✅ Le serveur ne démarre pas → Vérifiez les logs
2. ✅ Variables d'environnement incorrectes
3. ✅ Base de données non accessible
4. ✅ Port mal configuré

**Solutions :**
```bash
# Dans les logs, cherchez :
- "Error: connect ECONNREFUSED" → Problème de connexion DB
- "FATAL: password authentication failed" → Mauvais mot de passe DB
- "database \"maas_db\" does not exist" → Base non créée
```

### Le serveur démarre mais crash immédiatement

**Vérifiez :**
1. Les variables d'environnement sont toutes définies
2. La base de données existe et contient les tables
3. Le schéma `init.sql` a été exécuté

### Erreur de connexion PostgreSQL

```bash
# Testez la connexion depuis votre machine locale :
psql [INTERNAL_DATABASE_URL]

# Si ça ne fonctionne pas, vérifiez :
- Que vous utilisez l'Internal Database URL (pas l'External)
- Que le mot de passe est correct (copiez-collez)
- Que la base est dans la même région que le web service
```

## 🔄 Mise à jour du Frontend

Modifiez `public/script.js` pour pointer vers votre URL Render :

```javascript
// En haut du fichier
const API_URL = 'https://matasondage.onrender.com';
```

Puis commitez et pushez :
```bash
git add public/script.js
git commit -m "Update API URL to Render deployment"
git push origin main
```

Render redéploiera automatiquement.

## 📊 Monitoring

**Surveiller votre application :**
- **Logs** : https://dashboard.render.com → Votre service → Logs
- **Métriques** : Onglet "Metrics" pour voir CPU, mémoire, requêtes
- **Health check** : Configurez `/api/health` comme health check endpoint

## 🔐 Sécurité en Production

1. **Protéger les endpoints admin** :
   ```env
   ADMIN_TOKEN=votre_token_super_secret_complexe
   ```

2. **Activer le rate limiting** (à implémenter dans server.js)

3. **CORS** : Limitez les origines autorisées si besoin

## 💰 Plan Free vs Paid

**Plan Free (gratuit) :**
- ✅ Serveur peut s'endormir après 15 min d'inactivité
- ✅ 750h/mois de temps d'exécution
- ✅ PostgreSQL : 90 jours d'expiration, 1GB de stockage
- ⚠️ Premier chargement peut être lent (cold start)

**Plan Starter (7$/mois) :**
- ✅ Pas de mise en veille
- ✅ Démarrage instantané
- ✅ PostgreSQL permanent

## 🎯 Prochaines Étapes

1. ✅ Résoudre l'erreur 502 en vérifiant les logs
2. ✅ Initialiser correctement la base de données
3. ✅ Tester avec Postman ou curl
4. ✅ Mettre à jour l'URL dans le frontend
5. ✅ Partager le lien avec vos investisseurs

---

**Besoin d'aide ?**
- Logs Render : https://dashboard.render.com
- Documentation : https://render.com/docs
- Support : https://render.com/support

**Date** : 23/01/2026

