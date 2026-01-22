-- Schéma de base de données pour le sondage Mata Investisseurs

-- Création de la table des réponses au sondage
CREATE TABLE IF NOT EXISTS reponses_sondage (
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
    ip_address VARCHAR(45),
    
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

-- Index pour améliorer les performances
CREATE INDEX idx_date_soumission ON reponses_sondage(date_soumission);
CREATE INDEX idx_email ON reponses_sondage(email);

-- Vue pour les statistiques
CREATE OR REPLACE VIEW statistiques_sondage AS
SELECT 
    COUNT(*) as total_reponses,
    COUNT(DISTINCT email) as investisseurs_uniques,
    COUNT(CASE WHEN objectif_principal = 'Gagner des dividendes' THEN 1 END) as objectif_dividendes,
    COUNT(CASE WHEN objectif_principal = 'Revendre mes parts plus cher (plus-value)' THEN 1 END) as objectif_plus_value,
    COUNT(CASE WHEN objectif_principal LIKE 'Non financier%' THEN 1 END) as objectif_non_financier,
    COUNT(CASE WHEN delai_attente = 'Autant que nécessaire' THEN 1 END) as delai_illimite,
    COUNT(CASE WHEN revente_plus_value = 'Oui' THEN 1 END) as accepte_revente_50,
    COUNT(CASE WHEN reinvestir = 'Oui' THEN 1 END) as reinvestirait,
    COUNT(CASE WHEN priorite_2026 IS NOT NULL THEN 1 END) as reponses_question_6,
    COUNT(CASE WHEN niveau_reporting IS NOT NULL THEN 1 END) as reponses_question_7
FROM reponses_sondage;

