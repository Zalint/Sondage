const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config();

// Configuration du serveur
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de la base de données PostgreSQL
// Utilise DATABASE_URL de Render si disponible, sinon les variables individuelles
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'maas_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // SSL requis pour les connexions Render/Heroku en production
    ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_URL 
        ? { rejectUnauthorized: false } 
        : false
});

// Test de connexion à la base de données
pool.on('connect', () => {
    console.log('✓ Connexion à PostgreSQL établie');
});

pool.on('error', (err) => {
    console.error('Erreur inattendue avec le client PostgreSQL:', err);
    process.exit(-1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// ==================== ROUTES ====================

// Route de test
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'OK',
            message: 'Serveur et base de données opérationnels',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        console.error('Erreur health check:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Erreur de connexion à la base de données'
        });
    }
});

// Route pour soumettre le sondage
app.post('/api/sondage', async (req, res) => {
    const client = await pool.connect();
    
    try {
        const {
            nom,
            email,
            objectif_principal,
            objectif_autre,
            delai_attente,
            delai_autre,
            revente_plus_value,
            revente_autre,
            reinvestir,
            reinvestir_autre,
            critere_determinant,
            critere_autre,
            priorite_2026,
            priorite_autre,
            niveau_reporting,
            reporting_autre
        } = req.body;

        // Validation des champs obligatoires
        if (!objectif_principal || !delai_attente || !revente_plus_value || 
            !reinvestir || !critere_determinant) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez répondre à toutes les questions obligatoires.'
            });
        }

        // Récupération de l'IP du client (prendre seulement la première IP si plusieurs via proxies)
        let ip_address = req.headers['x-forwarded-for'] || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress ||
                        'unknown';
        
        // Si x-forwarded-for contient plusieurs IPs, prendre seulement la première
        if (ip_address && ip_address.includes(',')) {
            ip_address = ip_address.split(',')[0].trim();
        }
        
        // Limiter la longueur à 100 caractères pour être sûr
        ip_address = ip_address.substring(0, 100);

        // Insertion dans la base de données
        const query = `
            INSERT INTO reponses_sondage (
                nom,
                email,
                objectif_principal,
                objectif_autre,
                delai_attente,
                delai_autre,
                revente_plus_value,
                revente_autre,
                reinvestir,
                reinvestir_autre,
                critere_determinant,
                critere_autre,
                priorite_2026,
                priorite_autre,
                niveau_reporting,
                reporting_autre,
                ip_address,
                date_soumission
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
            RETURNING id, date_soumission
        `;

        const values = [
            nom || null,
            email || null,
            objectif_principal,
            objectif_autre || null,
            delai_attente,
            delai_autre || null,
            revente_plus_value,
            revente_autre || null,
            reinvestir,
            reinvestir_autre || null,
            critere_determinant,
            critere_autre || null,
            priorite_2026 || null,
            priorite_autre || null,
            niveau_reporting || null,
            reporting_autre || null,
            ip_address
        ];

        const result = await client.query(query, values);

        console.log(`✓ Nouvelle réponse enregistrée (ID: ${result.rows[0].id})`);

        res.status(201).json({
            success: true,
            message: 'Vos réponses ont été enregistrées avec succès.',
            data: {
                id: result.rows[0].id,
                date_soumission: result.rows[0].date_soumission
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        
        if (error.code === '23514') {
            // Violation de contrainte CHECK
            return res.status(400).json({
                success: false,
                message: 'Valeur invalide dans une des réponses.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement de vos réponses. Veuillez réessayer.'
        });
    } finally {
        client.release();
    }
});

// Route pour récupérer les statistiques (optionnel - pour administration)
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM statistiques_sondage');
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques.'
        });
    }
});

// Route pour récupérer toutes les réponses (optionnel - pour administration)
app.get('/api/reponses', async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;
        
        const query = `
            SELECT 
                id,
                nom,
                email,
                objectif_principal,
                objectif_autre,
                delai_attente,
                delai_autre,
                revente_plus_value,
                revente_autre,
                reinvestir,
                reinvestir_autre,
                critere_determinant,
                critere_autre,
                priorite_2026,
                priorite_autre,
                niveau_reporting,
                reporting_autre,
                date_soumission
            FROM reponses_sondage
            ORDER BY date_soumission DESC
            LIMIT $1 OFFSET $2
        `;

        const result = await pool.query(query, [limit, offset]);
        const countResult = await pool.query('SELECT COUNT(*) FROM reponses_sondage');

        res.json({
            success: true,
            data: {
                reponses: result.rows,
                total: parseInt(countResult.rows[0].count),
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des réponses:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des réponses.'
        });
    }
});

// Route pour exporter les données en CSV (optionnel - pour administration)
app.get('/api/export/csv', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                COALESCE(nom, '') as nom,
                COALESCE(email, '') as email,
                objectif_principal,
                COALESCE(objectif_autre, '') as objectif_autre,
                delai_attente,
                COALESCE(delai_autre, '') as delai_autre,
                revente_plus_value,
                COALESCE(revente_autre, '') as revente_autre,
                reinvestir,
                COALESCE(reinvestir_autre, '') as reinvestir_autre,
                critere_determinant,
                COALESCE(critere_autre, '') as critere_autre,
                COALESCE(priorite_2026, '') as priorite_2026,
                COALESCE(priorite_autre, '') as priorite_autre,
                COALESCE(niveau_reporting, '') as niveau_reporting,
                COALESCE(reporting_autre, '') as reporting_autre,
                TO_CHAR(date_soumission, 'YYYY-MM-DD HH24:MI:SS') as date_soumission
            FROM reponses_sondage
            ORDER BY date_soumission DESC
        `);

        // Générer le CSV
        const headers = [
            'ID', 'Nom', 'Email', 'Objectif Principal', 'Objectif Autre',
            'Délai Attente', 'Délai Autre', 'Revente Plus-Value', 'Revente Autre',
            'Réinvestir', 'Réinvestir Autre', 'Critère Déterminant', 'Critère Autre',
            'Priorité 2026', 'Priorité Autre', 'Niveau Reporting', 'Reporting Autre',
            'Date Soumission'
        ];

        let csv = headers.join(',') + '\n';

        result.rows.forEach(row => {
            const values = [
                row.id,
                `"${row.nom.replace(/"/g, '""')}"`,
                `"${row.email.replace(/"/g, '""')}"`,
                `"${row.objectif_principal.replace(/"/g, '""')}"`,
                `"${row.objectif_autre.replace(/"/g, '""')}"`,
                `"${row.delai_attente.replace(/"/g, '""')}"`,
                `"${row.delai_autre.replace(/"/g, '""')}"`,
                `"${row.revente_plus_value.replace(/"/g, '""')}"`,
                `"${row.revente_autre.replace(/"/g, '""')}"`,
                `"${row.reinvestir.replace(/"/g, '""')}"`,
                `"${row.reinvestir_autre.replace(/"/g, '""')}"`,
                `"${row.critere_determinant.replace(/"/g, '""')}"`,
                `"${row.critere_autre.replace(/"/g, '""')}"`,
                `"${row.priorite_2026.replace(/"/g, '""')}"`,
                `"${row.priorite_autre.replace(/"/g, '""')}"`,
                `"${row.niveau_reporting.replace(/"/g, '""')}"`,
                `"${row.reporting_autre.replace(/"/g, '""')}"`,
                row.date_soumission
            ];
            csv += values.join(',') + '\n';
        });

        // Envoyer le fichier
        const filename = `sondage_mata_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csv); // BOM UTF-8 pour Excel
    } catch (error) {
        console.error('Erreur lors de l\'export CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'export CSV.'
        });
    }
});

// Route pour exporter les données en Excel (optionnel - pour administration)
app.get('/api/export/excel', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                COALESCE(nom, '') as nom,
                COALESCE(email, '') as email,
                objectif_principal,
                COALESCE(objectif_autre, '') as objectif_autre,
                delai_attente,
                COALESCE(delai_autre, '') as delai_autre,
                revente_plus_value,
                COALESCE(revente_autre, '') as revente_autre,
                reinvestir,
                COALESCE(reinvestir_autre, '') as reinvestir_autre,
                critere_determinant,
                COALESCE(critere_autre, '') as critere_autre,
                COALESCE(priorite_2026, '') as priorite_2026,
                COALESCE(priorite_autre, '') as priorite_autre,
                COALESCE(niveau_reporting, '') as niveau_reporting,
                COALESCE(reporting_autre, '') as reporting_autre,
                TO_CHAR(date_soumission, 'DD/MM/YYYY HH24:MI:SS') as date_soumission,
                ip_address
            FROM reponses_sondage
            ORDER BY date_soumission DESC
        `);

        // Préparer les données pour Excel
        const worksheetData = [
            // En-têtes
            [
                'ID', 
                'Nom', 
                'Email', 
                'Objectif Principal', 
                'Objectif (Autre)',
                'Délai d\'Attente', 
                'Délai (Autre)', 
                'Revente +50%', 
                'Revente (Autre)',
                'Réinvestir', 
                'Réinvestir (Autre)', 
                'Critère Déterminant', 
                'Critère (Autre)',
                'Priorité 2026', 
                'Priorité (Autre)', 
                'Niveau Reporting', 
                'Reporting (Autre)',
                'Date Soumission',
                'Adresse IP'
            ]
        ];

        // Ajouter les données
        result.rows.forEach(row => {
            worksheetData.push([
                row.id,
                row.nom,
                row.email,
                row.objectif_principal,
                row.objectif_autre,
                row.delai_attente,
                row.delai_autre,
                row.revente_plus_value,
                row.revente_autre,
                row.reinvestir,
                row.reinvestir_autre,
                row.critere_determinant,
                row.critere_autre,
                row.priorite_2026,
                row.priorite_autre,
                row.niveau_reporting,
                row.reporting_autre,
                row.date_soumission,
                row.ip_address || ''
            ]);
        });

        // Créer le workbook et la worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Définir la largeur des colonnes
        const columnWidths = [
            { wch: 5 },  // ID
            { wch: 20 }, // Nom
            { wch: 30 }, // Email
            { wch: 40 }, // Objectif Principal
            { wch: 30 }, // Objectif Autre
            { wch: 25 }, // Délai
            { wch: 25 }, // Délai Autre
            { wch: 15 }, // Revente
            { wch: 25 }, // Revente Autre
            { wch: 25 }, // Réinvestir
            { wch: 30 }, // Réinvestir Autre
            { wch: 40 }, // Critère
            { wch: 30 }, // Critère Autre
            { wch: 30 }, // Priorité 2026
            { wch: 30 }, // Priorité Autre
            { wch: 30 }, // Reporting
            { wch: 30 }, // Reporting Autre
            { wch: 20 }, // Date
            { wch: 15 }  // IP
        ];
        worksheet['!cols'] = columnWidths;

        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Réponses Sondage');

        // Créer une feuille de statistiques
        const statsResult = await pool.query('SELECT * FROM statistiques_sondage');
        const stats = statsResult.rows[0];
        
        const statsData = [
            ['STATISTIQUES DU SONDAGE MATA'],
            [''],
            ['Statistique', 'Valeur'],
            ['Total des réponses', stats.total_reponses],
            ['Investisseurs uniques', stats.investisseurs_uniques],
            ['Objectif: Dividendes', stats.objectif_dividendes],
            ['Objectif: Plus-value', stats.objectif_plus_value],
            ['Objectif: Non financier', stats.objectif_non_financier],
            ['Délai illimité accepté', stats.delai_illimite],
            ['Acceptent revente +50%', stats.accepte_revente_50],
            ['Réinvestiraient', stats.reinvestirait],
            ['Réponses question 6', stats.reponses_question_6],
            ['Réponses question 7', stats.reponses_question_7],
            [''],
            ['Date d\'export', new Date().toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })]
        ];

        const statsWorksheet = XLSX.utils.aoa_to_sheet(statsData);
        statsWorksheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Statistiques');

        // Générer le fichier Excel
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Envoyer le fichier
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
        const filename = `sondage_mata_${dateStr}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(excelBuffer);

        console.log(`✓ Export Excel généré: ${filename} (${result.rows.length} réponses)`);

    } catch (error) {
        console.error('Erreur lors de l\'export Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'export Excel.'
        });
    }
});

// Route principale - servir le formulaire
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
    });
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Sondage Mata - Stratégie 2026       ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`✓ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`✓ Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log('\nRoutes disponibles:');
    console.log(`  - GET  /                    (Formulaire)`);
    console.log(`  - POST /api/sondage         (Soumettre réponse)`);
    console.log(`  - GET  /api/health          (Status serveur)`);
    console.log(`  - GET  /api/stats           (Statistiques)`);
    console.log(`  - GET  /api/reponses        (Liste réponses)`);
    console.log(`  - GET  /api/export/csv      (Export CSV)`);
    console.log(`  - GET  /api/export/excel    (Export Excel)`);
    console.log('\nAppuyez sur Ctrl+C pour arrêter le serveur\n');
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
    console.log('\nSIGTERM reçu, arrêt gracieux du serveur...');
    server.close(() => {
        console.log('✓ Serveur arrêté');
        pool.end(() => {
            console.log('✓ Pool PostgreSQL fermé');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('\n\nSIGINT reçu, arrêt gracieux du serveur...');
    server.close(() => {
        console.log('✓ Serveur arrêté');
        pool.end(() => {
            console.log('✓ Pool PostgreSQL fermé');
            process.exit(0);
        });
    });
});

module.exports = app;

