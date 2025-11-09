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

      localStorage.setItem('user', JSON.stringify(updatedUser));
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