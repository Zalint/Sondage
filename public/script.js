// Configuration de l'API
const API_URL = window.location.origin;

// Références aux éléments DOM
const form = document.getElementById('sondageForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Mapping des champs "Autre" pour les selects et radios
const otherFieldsMapping = {
    'objectif_principal': {
        container: 'objectif_autre_container',
        input: 'objectif_autre'
    },
    'delai_attente': {
        container: 'delai_autre_container',
        input: 'delai_autre'
    },
    'revente_plus_value': {
        container: 'revente_autre_container',
        input: 'revente_autre'
    },
    'reinvestir': {
        container: 'reinvestir_autre_container',
        input: 'reinvestir_autre'
    },
    'critere_determinant': {
        container: 'critere_autre_container',
        input: 'critere_autre'
    },
    'priorite_2026': {
        container: 'priorite_autre_container',
        input: 'priorite_autre'
    },
    'niveau_reporting': {
        container: 'reporting_autre_container',
        input: 'reporting_autre'
    }
};

// Fonction pour afficher/masquer le champ "Autre" pour les selects
function setupSelectOtherFields() {
    Object.keys(otherFieldsMapping).forEach(fieldName => {
        const select = document.getElementById(fieldName);
        const mapping = otherFieldsMapping[fieldName];
        const container = document.getElementById(mapping.container);
        const input = document.getElementById(mapping.input);

        if (select && select.tagName === 'SELECT') {
            select.addEventListener('change', function() {
                if (this.value === 'Autre') {
                    container.style.display = 'block';
                    input.setAttribute('required', 'required');
                    input.focus();
                } else {
                    container.style.display = 'none';
                    input.removeAttribute('required');
                    input.value = '';
                }
            });
        }
    });
}

// Fonction pour afficher/masquer le champ "Autre" pour les radios
function setupRadioOtherFields() {
    Object.keys(otherFieldsMapping).forEach(fieldName => {
        const radios = document.querySelectorAll(`input[name="${fieldName}"]`);
        
        if (radios.length > 0 && radios[0].type === 'radio') {
            const mapping = otherFieldsMapping[fieldName];
            const container = document.getElementById(mapping.container);
            const input = document.getElementById(mapping.input);

            radios.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.value === 'Autre' && this.checked) {
                        container.style.display = 'block';
                        input.setAttribute('required', 'required');
                        input.focus();
                    } else if (this.checked) {
                        container.style.display = 'none';
                        input.removeAttribute('required');
                        input.value = '';
                    }
                });
            });
        }
    });
}

// Fonction pour collecter les données du formulaire
function collectFormData() {
    const formData = new FormData(form);
    const data = {};

    // Champs de base
    data.nom = formData.get('nom') || null;
    data.email = formData.get('email') || null;

    // Question 1
    data.objectif_principal = formData.get('objectif_principal');
    data.objectif_autre = formData.get('objectif_principal') === 'Autre' 
        ? formData.get('objectif_autre') : null;

    // Question 2
    data.delai_attente = formData.get('delai_attente');
    data.delai_autre = formData.get('delai_attente') === 'Autre' 
        ? formData.get('delai_autre') : null;

    // Question 3
    data.revente_plus_value = formData.get('revente_plus_value');
    data.revente_autre = formData.get('revente_plus_value') === 'Autre' 
        ? formData.get('revente_autre') : null;

    // Question 4 - Priorité (maintenant avant réinvestir)
    data.priorite_2026 = formData.get('priorite_2026') || null;
    data.priorite_autre = formData.get('priorite_2026') === 'Autre' 
        ? formData.get('priorite_autre') : null;

    // Question 5 - Réinvestir
    data.reinvestir = formData.get('reinvestir');
    data.reinvestir_autre = formData.get('reinvestir') === 'Autre' 
        ? formData.get('reinvestir_autre') : null;

    // Question 6 - Critère
    data.critere_determinant = formData.get('critere_determinant');
    data.critere_autre = formData.get('critere_determinant') === 'Autre' 
        ? formData.get('critere_autre') : null;

    // Question 7 (optionnel)
    data.niveau_reporting = formData.get('niveau_reporting') || null;
    data.reporting_autre = formData.get('niveau_reporting') === 'Autre' 
        ? formData.get('reporting_autre') : null;

    return data;
}

// Fonction pour valider les données
function validateFormData(data) {
    // Vérifier les champs obligatoires
    const requiredFields = [
        'objectif_principal',
        'delai_attente',
        'revente_plus_value',
        'reinvestir',
        'critere_determinant'
    ];

    for (const field of requiredFields) {
        if (!data[field]) {
            return {
                valid: false,
                message: 'Veuillez répondre à toutes les questions obligatoires.'
            };
        }
    }

    // Vérifier que les champs "Autre" sont remplis si sélectionnés
    if (data.objectif_principal === 'Autre' && !data.objectif_autre) {
        return { valid: false, message: 'Veuillez préciser votre objectif principal.' };
    }
    if (data.delai_attente === 'Autre' && !data.delai_autre) {
        return { valid: false, message: 'Veuillez préciser le délai d\'attente.' };
    }
    if (data.revente_plus_value === 'Autre' && !data.revente_autre) {
        return { valid: false, message: 'Veuillez préciser votre réponse à la question sur la revente.' };
    }
    if (data.reinvestir === 'Autre' && !data.reinvestir_autre) {
        return { valid: false, message: 'Veuillez préciser votre réponse sur le réinvestissement.' };
    }
    if (data.critere_determinant === 'Autre' && !data.critere_autre) {
        return { valid: false, message: 'Veuillez préciser le critère déterminant.' };
    }
    if (data.priorite_2026 === 'Autre' && !data.priorite_autre) {
        return { valid: false, message: 'Veuillez préciser la priorité 2026.' };
    }
    if (data.niveau_reporting === 'Autre' && !data.reporting_autre) {
        return { valid: false, message: 'Veuillez préciser le niveau de reporting.' };
    }

    // Validation email si fourni
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return {
                valid: false,
                message: 'Veuillez entrer une adresse email valide.'
            };
        }
    }

    return { valid: true };
}

// Fonction pour afficher le loader
function showLoader() {
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
}

// Fonction pour masquer le loader
function hideLoader() {
    submitBtn.disabled = false;
    btnText.style.display = 'inline-block';
    btnLoader.style.display = 'none';
}

// Fonction pour afficher le message de succès
function showSuccess() {
    form.style.display = 'none';
    successMessage.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fonction pour afficher le message d'erreur
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Masquer le message après 5 secondes
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Fonction pour soumettre le formulaire
async function submitForm(data) {
    try {
        const response = await fetch(`${API_URL}/api/sondage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Une erreur est survenue lors de l\'envoi du formulaire.');
        }

        return result;
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        throw error;
    }
}

// Gestionnaire de soumission du formulaire
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Masquer les messages d'erreur précédents
    errorMessage.style.display = 'none';

    // Collecter les données
    const data = collectFormData();

    // Valider les données
    const validation = validateFormData(data);
    if (!validation.valid) {
        showError(validation.message);
        return;
    }

    // Afficher le loader
    showLoader();

    try {
        // Soumettre le formulaire
        await submitForm(data);

        // Afficher le message de succès
        hideLoader();
        showSuccess();
    } catch (error) {
        // Afficher le message d'erreur
        hideLoader();
        showError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
});

// Animation smooth pour les inputs
document.querySelectorAll('input[type="text"], input[type="email"]').forEach(input => {
    input.addEventListener('focus', function() {
        this.style.transform = 'scale(1.01)';
        this.style.transition = 'transform 0.2s';
    });

    input.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
    });
});

// Animation pour les selects
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('focus', function() {
        this.style.transform = 'scale(1.01)';
        this.style.transition = 'transform 0.2s';
    });

    select.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
    });
});

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    setupSelectOtherFields();
    setupRadioOtherFields();

    // Message de bienvenue dans la console
    console.log('%c MATA - STRATÉGIE 2026 ', 'background: #c73e1d; color: white; font-size: 16px; font-weight: bold; padding: 10px;');
    console.log('Formulaire initialisé avec succès.');
});

// Prévenir la perte de données accidentelle
let formModified = false;
form.addEventListener('change', () => {
    formModified = true;
});

window.addEventListener('beforeunload', (e) => {
    if (formModified && successMessage.style.display !== 'block') {
        e.preventDefault();
        e.returnValue = '';
    }
});
