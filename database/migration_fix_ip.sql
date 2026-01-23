-- Migration pour augmenter la taille du champ ip_address
-- Date: 23-01-2026
-- Raison: Les IPs avec proxies (Render, CloudFlare) peuvent dépasser 45 caractères

-- Augmenter la taille du champ ip_address à 100 caractères
ALTER TABLE reponses_sondage 
ALTER COLUMN ip_address TYPE VARCHAR(100);

-- Vérifier le changement
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'reponses_sondage' 
  AND column_name = 'ip_address';

-- Message de confirmation
SELECT 'Migration réussie: ip_address est maintenant VARCHAR(100)' as message;

