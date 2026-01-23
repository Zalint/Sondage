# 🔐 Guide d'Administration - Mata Sondage

## 🎯 Nouvelles Fonctionnalités Ajoutées

✅ **Page de login sécurisée** pour accéder aux résultats  
✅ **Suppression de réponses** individuelles  
✅ **Authentification par token** avec expiration 24h  
✅ **Bouton de déconnexion** sur toutes les pages admin  

---

## 🚀 Utilisation

### 1️⃣ Configuration des Identifiants

Dans votre fichier `.env` sur Render, ajoutez :

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=VotreMotDePasseSecurise123!
```

**Important** : Changez `VotreMotDePasseSecurise123!` par un mot de passe fort !

### 2️⃣ Accéder aux Résultats

1. **Allez sur** : `https://matasondage.onrender.com/results.html`
2. Vous serez **automatiquement redirigé** vers `/login.html`
3. **Connectez-vous** avec vos identifiants `.env`
4. Vous serez redirigé vers les résultats

### 3️⃣ Supprimer une Réponse

Sur la page `results.html` :

1. Chaque réponse affiche un bouton **🗑️ Supprimer** en haut à droite
2. Cliquez sur le bouton
3. **Confirmez** la suppression (action irréversible !)
4. La réponse disparaît immédiatement

### 4️⃣ Déconnexion

Cliquez sur le bouton **🚪 Déconnexion** en haut de la page.

---

## 🔒 Sécurité

### Protection des Pages

- `/results.html` : ✅ Protégée par login
- `/admin.html` : ⚠️ Accessible publiquement (statistiques)
- `/login.html` : 🔓 Page de connexion publique

### Tokens

- **Expiration** : 24 heures après connexion
- **Stockage** : localStorage du navigateur
- **Validation** : Vérifiée à chaque requête DELETE

### Bonnes Pratiques

1. ✅ Utilisez un mot de passe fort (12+ caractères)
2. ✅ Ne partagez jamais vos identifiants
3. ✅ Déconnectez-vous après utilisation
4. ✅ Changez le mot de passe régulièrement

---

## 🌐 URLs Importantes

### URLs Publiques
```
https://matasondage.onrender.com/           → Formulaire public
https://matasondage.onrender.com/admin.html → Statistiques (public)
```

### URLs Protégées (nécessitent login)
```
https://matasondage.onrender.com/results.html → Liste complète des réponses
https://matasondage.onrender.com/login.html   → Page de connexion
```

### API Endpoints Protégés
```
POST   /api/admin/login          → Connexion
POST   /api/admin/logout         → Déconnexion
DELETE /api/admin/reponse/:id    → Supprimer une réponse
```

---

## 📋 Configuration sur Render

### Variables d'Environnement Requises

Allez dans **Environment** de votre service Render et ajoutez :

```env
# Base de données (déjà configuré)
DATABASE_URL=postgresql://...

# Production (déjà configuré)
NODE_ENV=production

# NOUVEAU - Identifiants Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=VotreMotDePasseSecurise123!
```

**Après modification** : Render redéploiera automatiquement (1-2 minutes).

---

## 🔧 Résolution de Problèmes

### ❌ "Identifiants incorrects"

**Cause** : Username ou password incorrect dans `.env`

**Solution** :
1. Vérifiez `ADMIN_USERNAME` et `ADMIN_PASSWORD` sur Render
2. Pas d'espaces avant/après les valeurs
3. Redéployez si vous venez de les ajouter

### ❌ "Token invalide ou expiré"

**Cause** : Token expiré après 24h ou serveur redémarré

**Solution** :
1. Cliquez sur **🚪 Déconnexion**
2. Reconnectez-vous via `/login.html`

### ❌ Erreur lors de la suppression

**Cause** : Problème de base de données ou permissions

**Solution** :
1. Vérifiez les logs Render
2. Assurez-vous que la réponse existe encore
3. Reconnectez-vous si nécessaire

### ❌ Redirection infinie vers /login.html

**Cause** : Token non stocké ou effacé

**Solution** :
1. Effacez le cache du navigateur
2. Essayez en navigation privée
3. Vérifiez que JavaScript est activé

---

## 🎨 Personnalisation

### Changer le Logo

Modifiez `public/login.html` :

```html
<div class="logo">
    <h1>VOTRE LOGO</h1>
    <p>Administration</p>
</div>
```

### Changer les Couleurs

Dans `public/login.html`, modifiez les styles CSS :

```css
body {
    background: linear-gradient(135deg, #VOS_COULEURS);
}
```

### Durée d'Expiration du Token

Dans `server.js`, ligne ~105 :

```javascript
// Expirer après 24h (modifiable)
setTimeout(() => {
    validTokens.delete(token);
}, 24 * 60 * 60 * 1000); // 24h en millisecondes
```

---

## 📊 Utilisation Typique

### Workflow Standard

1. **Le matin** : Connexion via `/login.html`
2. **Consulter** : Voir les nouvelles réponses sur `/results.html`
3. **Analyser** : Vérifier les statistiques sur `/admin.html`
4. **Nettoyer** : Supprimer les doublons ou tests
5. **Exporter** : Télécharger CSV pour analyse
6. **Le soir** : Déconnexion

### Nettoyage Régulier

Supprimez :
- ✅ Les réponses de test
- ✅ Les doublons
- ✅ Les réponses incomplètes/invalides

---

## 🆘 Support

### Logs Serveur

Pour voir les connexions et suppressions :

1. Render Dashboard → Votre service
2. Onglet **"Logs"**
3. Cherchez :
   ```
   ✓ Réponse #123 supprimée
   ```

### Tester en Local

```bash
# Démarrer le serveur local
npm start

# Accéder à
http://localhost:3000/login.html
```

---

## 🔐 Identifiants par Défaut

**⚠️ IMPORTANT** : Si vous n'avez pas configuré `.env`, les identifiants par défaut sont :

```
Username: admin
Password: Mata2026
```

**Changez-les IMMÉDIATEMENT en production !**

---

## ✅ Checklist de Configuration

- [ ] Variables `ADMIN_USERNAME` et `ADMIN_PASSWORD` ajoutées sur Render
- [ ] Service redéployé après ajout des variables
- [ ] Connexion testée sur `/login.html`
- [ ] Suppression testée sur une réponse de test
- [ ] Mot de passe fort utilisé (12+ caractères)
- [ ] Identifiants notés dans un endroit sécurisé
- [ ] Déconnexion testée

---

**Date** : 23/01/2026  
**Version** : 1.0.0  
**Auteur** : Mata Team

