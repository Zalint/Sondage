-- Script d'initialisation complet pour la base de données Mata Sondage
-- Date: 23-01-2026

-- Créer la base de données si elle n'existe pas
-- Note: Cette commande doit être exécutée depuis une connexion à postgres, pas maas_db
-- CREATE DATABASE maas_db;

-- Se connecter à la base maas_db avant d'exécuter les commandes suivantes
-- \c maas_db

-- Supprimer les objets existants si présents (pour réinitialisation)
DROP VIEW IF EXISTS statistiques_sondage CASCADE;
DROP TABLE IF EXISTS reponses_sondage CASCADE;

-- Créer la table des réponses
CREATE TABLE reponses_sondage (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    nom VARCHAR(255),
    
    -- Question 1: Objectif principal
    objectif_principal VARCHAR(100) NOT NULL,
    objectif_autre TEXT,
    
    -- Question 2: Délai d'attente
    delai_attente VARCHAR(100) NOT NULL,
    delai_autre TEXT,
    
    -- Question 3: Revente avec +50%
    revente_plus_value VARCHAR(50) NOT NULL,
    revente_autre TEXT,
    
    -- Question 4: Réinvestir
    reinvestir VARCHAR(100) NOT NULL,
    reinvestir_autre TEXT,
    
    -- Question 5: Critère déterminant
    critere_determinant VARCHAR(100) NOT NULL,
    critere_autre TEXT,
    
    -- Question 6: Priorité 2026 (optionnel)
    priorite_2026 VARCHAR(100),
    priorite_autre TEXT,
    
    -- Question 7: Niveau de reporting (optionnel)
    niveau_reporting VARCHAR(100),
    reporting_autre TEXT,
    
    -- Métadonnées
    date_soumission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(100),
    
    -- Contraintes de validation
    CONSTRAINT check_objectif CHECK (objectif_principal IN (
        'Gagner des dividendes',
        'Revendre mes parts plus cher (plus-value)',
        'Non financier : soutenir Ousmane / l''équipe / la vision',
        'Autre'
    )),
    
    CONSTRAINT check_delai CHECK (delai_attente IN (
        'Moins d''un an',
        '1 an',
        '2 ans',
        '3 ans',
        'Autant que nécessaire',
        'Autre'
    )),
    
    CONSTRAINT check_revente CHECK (revente_plus_value IN (
        'Oui',
        'Non',
        'Autre'
    )),
    
    CONSTRAINT check_reinvestir CHECK (reinvestir IN (
        'Oui',
        'Non',
        'Peut-être / sous conditions',
        'Autre'
    )),
    
    CONSTRAINT check_critere CHECK (critere_determinant IN (
        'Ousmane (leadership / exécution)',
        'Le potentiel du marché',
        'Le projet / la vision / l''impact',
        'Les éléments financiers (rendement, trajectoire, valorisation, etc.)',
        'Autre'
    ))
);

-- Créer les index pour améliorer les performances
CREATE INDEX idx_date_soumission ON reponses_sondage(date_soumission);
CREATE INDEX idx_email ON reponses_sondage(email);
CREATE INDEX idx_objectif ON reponses_sondage(objectif_principal);
CREATE INDEX idx_delai ON reponses_sondage(delai_attente);

-- Créer la vue pour les statistiques
CREATE OR REPLACE VIEW statistiques_sondage AS
SELECT 
    COUNT(*) as total_reponses,
    COUNT(DISTINCT email) as investisseurs_uniques,
    
    -- Question 1: Objectif principal
    COUNT(CASE WHEN objectif_principal = 'Gagner des dividendes' THEN 1 END) as objectif_dividendes,
    COUNT(CASE WHEN objectif_principal = 'Revendre mes parts plus cher (plus-value)' THEN 1 END) as objectif_plus_value,
    COUNT(CASE WHEN objectif_principal LIKE 'Non financier%' THEN 1 END) as objectif_non_financier,
    COUNT(CASE WHEN objectif_principal = 'Autre' THEN 1 END) as objectif_autre,
    
    -- Question 2: Délai d'attente
    COUNT(CASE WHEN delai_attente = 'Moins d''un an' THEN 1 END) as delai_moins_1an,
    COUNT(CASE WHEN delai_attente = '1 an' THEN 1 END) as delai_1an,
    COUNT(CASE WHEN delai_attente = '2 ans' THEN 1 END) as delai_2ans,
    COUNT(CASE WHEN delai_attente = '3 ans' THEN 1 END) as delai_3ans,
    COUNT(CASE WHEN delai_attente = 'Autant que nécessaire' THEN 1 END) as delai_illimite,
    
    -- Question 3: Revente +50%
    COUNT(CASE WHEN revente_plus_value = 'Oui' THEN 1 END) as accepte_revente_50,
    COUNT(CASE WHEN revente_plus_value = 'Non' THEN 1 END) as refuse_revente_50,
    
    -- Question 4: Réinvestir
    COUNT(CASE WHEN reinvestir = 'Oui' THEN 1 END) as reinvestirait,
    COUNT(CASE WHEN reinvestir = 'Non' THEN 1 END) as ne_reinvestirait_pas,
    COUNT(CASE WHEN reinvestir = 'Peut-être / sous conditions' THEN 1 END) as reinvestir_conditionnel,
    
    -- Question 5: Critère déterminant
    COUNT(CASE WHEN critere_determinant = 'Ousmane (leadership / exécution)' THEN 1 END) as critere_ousmane,
    COUNT(CASE WHEN critere_determinant = 'Le potentiel du marché' THEN 1 END) as critere_marche,
    COUNT(CASE WHEN critere_determinant = 'Le projet / la vision / l''impact' THEN 1 END) as critere_vision,
    COUNT(CASE WHEN critere_determinant LIKE 'Les éléments financiers%' THEN 1 END) as critere_financier,
    
    -- Questions optionnelles
    COUNT(CASE WHEN priorite_2026 IS NOT NULL THEN 1 END) as reponses_question_6,
    COUNT(CASE WHEN niveau_reporting IS NOT NULL THEN 1 END) as reponses_question_7,
    
    -- Dates
    MIN(date_soumission) as premiere_reponse,
    MAX(date_soumission) as derniere_reponse
FROM reponses_sondage;

-- Créer une vue pour les analyses détaillées
CREATE OR REPLACE VIEW analyse_detaillee AS
SELECT 
    'Objectif Principal' as categorie,
    objectif_principal as reponse,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM reponses_sondage), 0), 2) as pourcentage
FROM reponses_sondage
GROUP BY objectif_principal

UNION ALL

SELECT 
    'Délai Attente' as categorie,
    delai_attente as reponse,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM reponses_sondage), 0), 2) as pourcentage
FROM reponses_sondage
GROUP BY delai_attente

UNION ALL

SELECT 
    'Revente +50%' as categorie,
    revente_plus_value as reponse,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM reponses_sondage), 0), 2) as pourcentage
FROM reponses_sondage
GROUP BY revente_plus_value

UNION ALL

SELECT 
    'Réinvestir' as categorie,
    reinvestir as reponse,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM reponses_sondage), 0), 2) as pourcentage
FROM reponses_sondage
GROUP BY reinvestir

UNION ALL

SELECT 
    'Critère Déterminant' as categorie,
    critere_determinant as reponse,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM reponses_sondage), 0), 2) as pourcentage
FROM reponses_sondage
GROUP BY critere_determinant

UNION ALL

SELECT 
    'Priorité 2026' as categorie,
    COALESCE(priorite_2026, 'Non renseigné') as reponse,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM reponses_sondage), 0), 2) as pourcentage
FROM reponses_sondage
GROUP BY priorite_2026

UNION ALL

SELECT 
    'Niveau Reporting' as categorie,
    COALESCE(niveau_reporting, 'Non renseigné') as reponse,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM reponses_sondage), 0), 2) as pourcentage
FROM reponses_sondage
GROUP BY niveau_reporting

ORDER BY categorie, nombre DESC;

-- Afficher un message de confirmation
SELECT 'Base de données initialisée avec succès!' as message;
SELECT 'Tables créées: reponses_sondage' as info;
SELECT 'Vues créées: statistiques_sondage, analyse_detaillee' as info;

