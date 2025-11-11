// main.js — affiche les comptes stockés dans 'users'

function escapeHtml(s){ return String(s || '').replace(/[&<>\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]); }

document.addEventListener('DOMContentLoaded', ()=>{
  const listEl = document.getElementById('accountsList');
  const noEl = document.getElementById('noAccounts');
  if(!listEl || !noEl) return;

  // Lire les comptes depuis 'users'
  let users = [];
  try { users = JSON.parse(localStorage.getItem('users') || '[]'); } catch(e){ users = []; }

  if(!users || users.length === 0){
    noEl.style.display = 'block';
    listEl.style.display = 'none';
    console.info('[main] Aucun compte trouvé dans localStorage (users vide).');
    return;
  }

  noEl.style.display = 'none';
  listEl.style.display = 'block';

  // Mettre à jour le compteur visible
  const countEl = document.getElementById('accountsCount');
  if(countEl) countEl.textContent = `Comptes trouvés : ${users.length}`;

  // Créer une grille d'affichage
  const grid = document.createElement('div');
  grid.className = 'accounts-grid';

  users.forEach(u => {
    const card = document.createElement('div');
    card.className = 'account-card';
    card.innerHTML = `
      <div class="account-header">
        <span class="member-type">Membre</span>
      </div>
      <div class="account-content">
        <div class="account-info">
          <h3>${escapeHtml(u.name || '—')}</h3>
          <p class="account-email">${escapeHtml(u.email || '—')}</p>
        </div>
        <div class="account-stats">
          <div class="stat-row">
            <span class="stat-value">0</span>
            <span class="stat-label">Paris gagnés</span>
          </div>
        </div>
        <a href="#" class="account-action">Gérer</a>
      </div>
    `;

    // Permettre d'éditer un compte : on le place en 'user' puis on redirige
    const manageLink = card.querySelector('.account-action');
    if(manageLink){
      manageLink.addEventListener('click', (e) => {
        e.preventDefault();
        try { localStorage.setItem('user', JSON.stringify(u)); } catch(err){}
        window.location.href = 'account.html';
      });
    }

    grid.appendChild(card);
  });

  listEl.appendChild(grid);

  // Handler pour créer un compte test rapidement (si présent)
  const createBtn = document.getElementById('createTest');
  if(createBtn){
    createBtn.addEventListener('click', ()=>{
      const sample = { name: 'Test User', email: `test${Date.now()}@example.local`, password: 'secret' };
      users.push(sample);
      localStorage.setItem('users', JSON.stringify(users));
      alert('Compte test ajouté. La page va se recharger pour afficher le compte.');
      location.reload();
    });
  }
});