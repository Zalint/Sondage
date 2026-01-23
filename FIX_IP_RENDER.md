# 🔧 Fix: Erreur IP trop longue sur Render

## 🔴 Problème Résolu

Erreur : `value too long for type character varying(45)`

**Cause** : Le champ `ip_address` était limité à 45 caractères, mais les IPs via les proxies Render peuvent faire jusqu'à 98+ caractères.

**Solution** : 
1. ✅ Code corrigé pour prendre seulement la première IP
2. ✅ Champ agrandi de VARCHAR(45) à VARCHAR(100)
3. ⚠️ Vous devez **exécuter la migration SQL** sur Render

---

## 📋 Étapes pour Corriger (2 minutes)

### **1️⃣ Attendre le Redéploiement**

Render va automatiquement redéployer avec le code corrigé (1-2 minutes).

### **2️⃣ Exécuter la Migration SQL sur la Base de Données**

Vous devez modifier la structure de la table existante.

**Option A : Via Shell Render (Le plus simple)**

1. Allez sur https://dashboard.render.com
2. Cliquez sur votre base de données **"maas-db"**
3. Onglet **"Shell"** (ou "PSQL")
4. Copiez-collez cette commande :

```sql
ALTER TABLE reponses_sondage ALTER COLUMN ip_address TYPE VARCHAR(100);
```

5. Appuyez sur Entrée
6. Vous devriez voir : `ALTER TABLE`

**Option B : Depuis votre PC avec psql**

Ouvrez PowerShell et exécutez :

```bash
psql "postgresql://maas_db_2aut_user:iMcu2g66ERmFwmcBDaHCOVTxL3Wxf9gv@dpg-d5bal7shg0os73ddt9q0-a/maas_db_2aut" -c "ALTER TABLE reponses_sondage ALTER COLUMN ip_address TYPE VARCHAR(100);"
```

**Option C : Via le fichier de migration**

```bash
psql "postgresql://maas_db_2aut_user:iMcu2g66ERmFwmcBDaHCOVTxL3Wxf9gv@dpg-d5bal7shg0os73ddt9q0-a/maas_db_2aut" -f C:\Mata\Sondage\database\migration_fix_ip.sql
```

### **3️⃣ Vérifier que Ça Fonctionne**

Une fois la migration exécutée :

1. Allez sur : https://matasondage.onrender.com
2. Remplissez le formulaire
3. Cliquez sur **"ENVOYER MES RÉPONSES"**
4. ✅ Ça devrait fonctionner !

---

## 🔍 Vérifier la Migration

Pour confirmer que la migration a fonctionné :

```sql
-- Dans le Shell Render, exécutez :
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'reponses_sondage' 
  AND column_name = 'ip_address';
```

Devrait afficher :
```
column_name | data_type        | character_maximum_length
------------+------------------+-------------------------
ip_address  | character varying| 100
```

---

## 📊 Tester l'API

Après la migration, testez :

```bash
# Health check
curl https://matasondage.onrender.com/api/health

# Devrait retourner "OK"
```

---

## ✅ Changements Effectués

### **Code (server.js)**
```javascript
// Avant :
const ip_address = req.headers['x-forwarded-for'] || ...;

// Après :
let ip_address = req.headers['x-forwarded-for'] || ...;
if (ip_address && ip_address.includes(',')) {
    ip_address = ip_address.split(',')[0].trim(); // Prend la première IP
}
ip_address = ip_address.substring(0, 100); // Limite à 100 caractères
```

### **Base de Données**
```sql
-- Avant :
ip_address VARCHAR(45)

-- Après :
ip_address VARCHAR(100)
```

---

## 🎯 Résumé Rapide

```bash
# 1. Code déjà corrigé et poussé ✅
# 2. Attendre le redéploiement Render (1-2 min) ⏳
# 3. Exécuter dans Shell Render :

ALTER TABLE reponses_sondage ALTER COLUMN ip_address TYPE VARCHAR(100);

# 4. Tester le formulaire ✅
```

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

Partagez-moi :
1. Les nouveaux logs d'erreur
2. Le résultat de la vérification SQL ci-dessus

---

**Date** : 23/01/2026  
**Statut** : Code corrigé ✅ | Migration à exécuter ⚠️

