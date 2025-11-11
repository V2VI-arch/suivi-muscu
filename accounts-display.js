// accounts-display.js - Gestion de l'affichage des comptes sur la page d'accueil
document.addEventListener('DOMContentLoaded', () => {
    const accountsContainer = document.getElementById('userAccounts');
    if (!accountsContainer) return;
    
    // Ajouter la classe accounts-grid au conteneur
    accountsContainer.className = 'accounts-grid';

    // Récupérer tous les comptes depuis 'users'
    let users = [];
    try { users = JSON.parse(localStorage.getItem('users') || '[]'); } catch (e) { users = []; }

    // Si aucun 'users', fallback sur la clé unique 'user'
    if (!users || users.length === 0) {
        const single = localStorage.getItem('user');
        if (single) {
            try { users = [JSON.parse(single)]; } catch(e){ users = []; }
        }
    }

    if (!users || users.length === 0) {
        accountsContainer.innerHTML = `
            <div class="account-card">
                <div class="account-header">
                    <span class="member-type">Nouveau membre</span>
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
        users.forEach(user => {
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
        });
    } catch (e) {
        console.error('Erreur lors de l\'affichage des comptes:', e);
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