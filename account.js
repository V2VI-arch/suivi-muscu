// Gestionnaire de compte utilisateur
class AccountManager {
  constructor() {
    this.storageKey = 'userAccount';
    this.loadAccount();
  }

  loadAccount() {
    const data = localStorage.getItem(this.storageKey);
    this.account = data ? JSON.parse(data) : null;
  }

  createAccount(accountData) {
    const newAccount = {
      id: Date.now(),
      name: accountData.name,
      email: accountData.email,
      goal: accountData.goal || '',
      weight: parseFloat(accountData.weight) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.account = newAccount;
    this.saveAccount();
    return newAccount;
  }

  updateAccount(updates) {
    if (!this.account) return null;
    
    this.account = {
      ...this.account,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveAccount();
    return this.account;
  }

  getAccount() {
    return this.account;
  }

  hasAccount() {
    return this.account !== null;
  }

  deleteAccount() {
    this.account = null;
    localStorage.removeItem(this.storageKey);
  }

  saveAccount() {
    if (this.account) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.account));
    }
  }
}

// Instance globale
const accountManager = new AccountManager();

// Initialisation du DOM
document.addEventListener('DOMContentLoaded', () => {
  updateAccountDisplay();
  setupEventListeners();
});

function updateAccountDisplay() {
  const noAccountDiv = document.getElementById('noAccount');
  const accountCardDiv = document.getElementById('accountCard');
  const account = accountManager.getAccount();

  if (account) {
    // Afficher le formulaire de compte existant
    noAccountDiv.style.display = 'none';
    accountCardDiv.style.display = 'block';
    
    // Remplir le formulaire avec les données existantes
    document.getElementById('acc_name').value = account.name;
    document.getElementById('acc_email').value = account.email;
    document.getElementById('acc_goal').value = account.goal;
    document.getElementById('acc_weight').value = account.weight;
  } else {
    // Afficher le message "Aucun compte"
    noAccountDiv.style.display = 'block';
    accountCardDiv.style.display = 'none';
  }
}

function setupEventListeners() {
  const form = document.getElementById('accountForm');
  const logoutBtn = document.getElementById('logout');
  const noAccountDiv = document.getElementById('noAccount');

  // Ajouter un bouton de création si aucun compte
  if (!accountManager.hasAccount() && !document.getElementById('createAccountBtn')) {
    const createBtn = document.createElement('button');
    createBtn.id = 'createAccountBtn';
    createBtn.type = 'button';
    createBtn.className = 'btn primary';
    createBtn.textContent = 'Créer mon compte';
    createBtn.style.marginTop = '1rem';
    
    createBtn.addEventListener('click', () => {
      showCreateAccountForm();
    });
    
    noAccountDiv.appendChild(createBtn);
  }

  // Soumission du formulaire
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const accountData = {
      name: document.getElementById('acc_name').value,
      email: document.getElementById('acc_email').value,
      goal: document.getElementById('acc_goal').value,
      weight: document.getElementById('acc_weight').value
    };

    // Vérifier les champs obligatoires
    if (!accountData.name || !accountData.email) {
      showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    // Vérifier le format de l'email
    if (!isValidEmail(accountData.email)) {
      showNotification('Email invalide', 'error');
      return;
    }

    if (accountManager.hasAccount()) {
      // Mise à jour
      accountManager.updateAccount(accountData);
      showNotification('Profil mis à jour avec succès! ✅');
    } else {
      // Création
      accountManager.createAccount(accountData);
      showNotification('Compte créé avec succès! ✅');
    }

    updateAccountDisplay();
  });

  // Déconnexion
  logoutBtn.addEventListener('click', () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte?\nTous vos entraînements seront supprimés.')) {
      // Supprimer le compte et les entraînements
      accountManager.deleteAccount();
      
      // Supprimer aussi les entraînements
      localStorage.removeItem('workoutData');
      
      showNotification('Compte supprimé ❌');
      setTimeout(() => {
        location.reload();
      }, 500);
    }
  });
}

function showCreateAccountForm() {
  const noAccountDiv = document.getElementById('noAccount');
  const accountCardDiv = document.getElementById('accountCard');
  
  // Masquer le message et afficher le formulaire
  noAccountDiv.style.display = 'none';
  accountCardDiv.style.display = 'block';

  // Effacer les champs
  document.getElementById('accountForm').reset();

  // Changer le texte du bouton de déconnexion en "Annuler"
  const logoutBtn = document.getElementById('logout');
  const originalText = logoutBtn.textContent;
  logoutBtn.textContent = 'Annuler';
  
  logoutBtn.onclick = () => {
    noAccountDiv.style.display = 'block';
    accountCardDiv.style.display = 'none';
    logoutBtn.textContent = originalText;
    logoutBtn.onclick = null;
  };

  // Focus sur le premier champ
  document.getElementById('acc_name').focus();
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}

// Vérifier si l'utilisateur a un compte au chargement de la page
window.addEventListener('load', () => {
  if (!accountManager.hasAccount()) {
    // Afficher un message d'accueil
    const mainContent = document.querySelector('main .container');
    if (mainContent) {
      const welcomeMsg = document.createElement('div');
      welcomeMsg.className = 'card welcome-card';
      welcomeMsg.innerHTML = `
        <h2>Bienvenue sur Suivi Muscu! 💪</h2>
        <p>Créez votre compte pour commencer à suivre vos entraînements et vos statistiques.</p>
        <p class="text-muted">Une fois votre compte créé, vos données seront sauvegardées localement sur votre appareil.</p>
      `;
      mainContent.insertBefore(welcomeMsg, mainContent.firstChild);
    }
  }
});
          const byEmail = users.findIndex(u=> (u.email||'').toLowerCase() === (updatedUser.email||'').toLowerCase());
          if(byEmail !== -1) users[byEmail] = updatedUser;
          else users.push(updatedUser);
        }
        localStorage.setItem('users', JSON.stringify(users));
      } catch (err) {
        console.warn('Impossible de mettre à jour users dans localStorage:', err);
      }

      alert('Modifications sauvegardées avec succès!');
    });

    // Gérer la déconnexion
    logoutBtn.addEventListener('click', () => {
      if(confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      }
    });

  } catch(e) {
    console.error('Erreur lors du chargement du compte:', e);
    noAccountEl.style.display = 'block';
    accountCardEl.style.display = 'none';
  }
});