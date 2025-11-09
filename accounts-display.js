// accounts-display.js - Gestion de l'affichage des comptes sur la page d'accueil
document.addEventListener('DOMContentLoaded', () => {
    const accountsContainer = document.getElementById('userAccounts');
    if (!accountsContainer) return;
    
    // Ajouter la classe accounts-grid au conteneur
    accountsContainer.className = 'accounts-grid';

    // Récupérer le compte existant
    const userData = localStorage.getItem('user');
    if (!userData) {
        accountsContainer.innerHTML = `
            <div class="account-card">
                <div class="account-header">
                    <span class="member-type">Nouveau membre</span>
                    <span class="member-date">Aujourd'hui</span>
                </div>
                <div class="account-content">
                    <h3>Rejoignez la communauté</h3>
                    <p>Accédez aux pronostics VIP en devenant membre</p>
                    <button onclick="document.getElementById('openSignup').click()" class="btn primary">
                        S'inscrire maintenant
                    </button>
                </div>
            </div>
        `;
        return;
    }

    try {
        const user = JSON.parse(userData);
        const accountCard = document.createElement('div');
        accountCard.className = 'account-card';
        accountCard.innerHTML = `
            <div class="account-header">
                <span class="member-type">Membre</span>
            </div>
            <div class="account-content">
                <div class="account-info">
                    <h3>${escapeHtml(user.name)}</h3>
                    <p class="account-email">${escapeHtml(user.email)}</p>
                </div>
                <div class="account-stats">
                    <div class="stat-row">
                        <span class="stat-value">0</span>
                        <span class="stat-label">Paris gagnés</span>
                    </div>
                </div>
                <a href="account.html" class="account-action">Gérer</a>
            </div>
        `;

        accountsContainer.appendChild(accountCard);
    } catch (e) {
        console.error('Erreur lors de l\'affichage du compte:', e);
    }
});

// Fonction utilitaire pour échapper le HTML
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}