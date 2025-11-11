// account.js — gère l'affichage et la modification du compte utilisateur
document.addEventListener('DOMContentLoaded', () => {
  const noAccountEl = document.getElementById('noAccount');
  const accountCardEl = document.getElementById('accountCard');
  const form = document.getElementById('accountForm');
  const logoutBtn = document.getElementById('logout');

  // Récupérer les données du compte
  const userData = localStorage.getItem('user');
  if (!userData) {
    noAccountEl.style.display = 'block';
    accountCardEl.style.display = 'none';
    return;
  }

  try {
    const user = JSON.parse(userData);
    const originalEmail = user.email || '';
    
    // Afficher le formulaire avec les données actuelles
    noAccountEl.style.display = 'none';
    accountCardEl.style.display = 'block';
    
    // Remplir le formulaire
    document.getElementById('acc_name').value = user.name || '';
    document.getElementById('acc_email').value = user.email || '';
    document.getElementById('acc_password').value = user.password || '';

    // Gérer la sauvegarde des modifications
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const updatedUser = {
        name: document.getElementById('acc_name').value.trim(),
        email: document.getElementById('acc_email').value.trim(),
        password: document.getElementById('acc_password').value
      };

      // Mettre à jour la clé 'user' (compte courant)
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Mettre à jour l'entrée correspondante dans 'users' si elle existe
      try {
        const raw = localStorage.getItem('users');
        const users = raw ? JSON.parse(raw) : [];
        const idx = users.findIndex(u => (u.email||'').toLowerCase() === (originalEmail||'').toLowerCase());
        if (idx !== -1) {
          users[idx] = updatedUser;
        } else {
          // si non trouvée (edge case), ajouter/update par email
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