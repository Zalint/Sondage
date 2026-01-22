# ✅ Checklist Render - Résoudre l'erreur 502

## 🔍 Diagnostic de l'Erreur

Votre erreur actuelle :
```
POST https://matasondage.onrender.com/api/sondage 502 (Bad Gateway)
```

Cela signifie que le serveur backend **n'est pas accessible** ou **ne répond pas**.

---

## 📋 Étapes à Suivre MAINTENANT

### 1️⃣ Vérifier les LOGS sur Render

1. Allez sur : https://dashboard.render.com
2. Cliquez sur votre service **"mata-sondage"** (ou le nom que vous avez donné)
3. Cliquez sur l'onglet **"Logs"**

**Que chercher dans les logs :**

✅ **Si le serveur démarre correctement, vous devriez voir :**
```
✓ Connexion à PostgreSQL établie
✓ Serveur démarré sur http://0.0.0.0:10000
```

❌ **Si vous voyez des erreurs :**

**Erreur 1 : Connexion PostgreSQL échoue**
```
Error: connect ECONNREFUSED
Error: getaddrinfo ENOTFOUND
FATAL: password authentication failed
```
➡️ **Solution** : Vos variables d'environnement DB sont incorrectes

**Erreur 2 : Base de données n'existe pas**
```
error: database "maas_db" does not exist
```
➡️ **Solution** : Vous devez créer la base de données PostgreSQL sur Render

**Erreur 3 : Tables n'existent pas**
```
error: relation "reponses_sondage" does not exist
```
➡️ **Solution** : Vous devez exécuter le fichier `database/init.sql`

---

### 2️⃣ Créer la Base de Données PostgreSQL (si pas déjà fait)

1. Sur Render Dashboard : https://dashboard.render.com
2. Cliquez sur **"New +"** → **"PostgreSQL"**
3. Configurez :
   ```
   Name: maas-db
   Database Name: maas_db
   Region: Frankfurt (même région que votre web service)
   PostgreSQL Version: 15
   Plan: Free
   ```
4. Cliquez **"Create Database"**
5. ⏳ Attendez 2-3 minutes que la base soit créée

---

### 3️⃣ Initialiser le Schéma de la Base de Données

Une fois la base créée, vous devez créer les tables :

**Option A : Via l'interface Render (Shell)**
1. Dans votre base de données Render, onglet **"Shell"**
2. Copiez-collez le contenu COMPLET du fichier `database/init.sql`
3. Exécutez

**Option B : Depuis votre ordinateur (Recommandé)**
1. Dans Render, copiez l'**External Database URL** (onglet "Info")
2. Sur votre PC, ouvrez PowerShell et exécutez :
   ```bash
   psql "postgresql://user:password@host/maas_db" -f C:\Mata\Sondage\database\init.sql
   ```

**Option C : Via pgAdmin**
1. Téléchargez pgAdmin : https://www.pgadmin.org/
2. Créez une nouvelle connexion avec les infos de Render
3. Ouvrez Query Tool
4. Copiez le contenu de `init.sql` et exécutez

---

### 4️⃣ Configurer les Variables d'Environnement

Dans votre Web Service Render :

1. Allez dans **"Environment"** (menu à gauche)
2. Ajoutez ces variables :

**Si vous utilisez DATABASE_URL (Recommandé) :**
```env
DATABASE_URL=[Copiez l'Internal Database URL depuis votre DB Render]
NODE_ENV=production
```

**OU si vous utilisez les variables séparées :**
```env
DB_HOST=[hostname depuis Render]
DB_PORT=5432
DB_NAME=maas_db
DB_USER=maas_db_user
DB_PASSWORD=[password depuis Render]
NODE_ENV=production
```

3. Cliquez **"Save Changes"**
4. Render va automatiquement redéployer votre app

---

### 5️⃣ Attendre le Redéploiement

Après avoir ajouté les variables d'environnement :

1. Render va automatiquement redéployer (1-2 minutes)
2. Surveillez les **Logs** en temps réel
3. Attendez de voir :
   ```
   ✓ Connexion à PostgreSQL établie
   ✓ Serveur démarré
   ```

---

### 6️⃣ Tester l'API

Une fois le serveur démarré, testez ces URLs dans votre navigateur :

1. **Health Check** :
   ```
   https://matasondage.onrender.com/api/health
   ```
   Devrait retourner :
   ```json
   {
     "status": "OK",
     "message": "Serveur et base de données opérationnels"
   }
   ```

2. **Stats** :
   ```
   https://matasondage.onrender.com/api/stats
   ```
   Devrait retourner des statistiques (zéros si pas de données)

---

## 🚨 Problèmes Courants

### ❌ "Application failed to respond"

**Cause** : Le serveur n'écoute pas sur le bon port

**Solution** : Vérifiez que `server.js` utilise :
```javascript
const PORT = process.env.PORT || 3000;
```

Render définit automatiquement `process.env.PORT` à 10000.

---

### ❌ "Build failed"

**Cause** : Problème lors de `npm install`

**Solution** : 
1. Vérifiez que `package.json` existe
2. Dans Render, Build Command doit être : `npm install`
3. Start Command doit être : `node server.js`

---

### ❌ Les logs montrent "Error: connect ECONNREFUSED"

**Cause** : Variables de connexion DB incorrectes

**Solution** :
1. Vérifiez que vous avez créé la base PostgreSQL sur Render
2. Copiez l'**Internal Database URL** (pas External!)
3. Ajoutez-la comme variable `DATABASE_URL`

---

## 📸 Screenshots des Paramètres Corrects

**Web Service Settings :**
```
Runtime: Node
Build Command: npm install
Start Command: node server.js
```

**Environment Variables (Minimum) :**
```
DATABASE_URL=postgresql://user:pass@host:5432/maas_db
NODE_ENV=production
```

---

## 🆘 Toujours bloqué ?

**Partagez-moi :**
1. Le contenu complet des **Logs** de Render
2. Vos **Environment Variables** (masquez les mots de passe)
3. Le statut de votre base de données (Running/Building/Failed)

---

## ✅ Une fois que ça fonctionne

1. Testez le formulaire : https://matasondage.onrender.com
2. Testez l'admin : https://matasondage.onrender.com/admin.html
3. Partagez le lien avec vos investisseurs ! 🎉

**Note** : Sur le plan gratuit, la première requête peut prendre 30-60 secondes si l'app était en veille.

---

**Date** : 23/01/2026

