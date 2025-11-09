// main.js — liste tous les comptes détectés dans localStorage

function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]); }

document.addEventListener('DOMContentLoaded', ()=>{
  const listEl = document.getElementById('accountsList');
  const noEl = document.getElementById('noAccounts');
  const found = [];
  
  // Vérifier s'il y a déjà un compte
  const existingUser = localStorage.getItem('user');
  if (existingUser) {
    try {
      const userData = JSON.parse(existingUser);
      found.push({ key: 'user', ...userData });
      // Supprimer tous les autres comptes s'ils existent
      for(let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if(key !== 'user') {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if(data && typeof data === 'object' && ('name' in data || 'email' in data)) {
              localStorage.removeItem(key);
            }
          } catch(e) {}
        }
      }
    } catch(e) {
      console.error('Erreur lors de la lecture du compte:', e);
    }
  }

  // Parcours de toutes les clés de localStorage
  for(let i=0;i<localStorage.length;i++){
    const key = localStorage.key(i);
    const raw = localStorage.getItem(key);
    if(!raw) continue;
    try{
      const data = JSON.parse(raw);
      if(data && typeof data === 'object'){
        // heuristique : un compte contient au moins un nom ou un email
        if(('name' in data) || ('email' in data) || ('username' in data)){
          found.push({key, ...data});
        }
        // si c'est un tableau d'utilisateurs
        else if(Array.isArray(data)){
          data.forEach(u=>{ if(u && typeof u === 'object' && ('name' in u || 'email' in u)) found.push({key, ...u}); });
        }
      }
    }catch(e){
      // valeur non JSON, on ignore
    }
  }

  // Dédupliquer par email si possible
  const byEmail = {};
  const dedup = [];
  found.forEach(a=>{
    const email = (a.email||'').toLowerCase();
    if(email){ if(!byEmail[email]){ byEmail[email]=true; dedup.push(a); } }
    else { dedup.push(a); }
  });

  if(dedup.length === 0){
    noEl.style.display = 'block';
    listEl.style.display = 'none';
    console.info('[main] Aucun compte trouvé dans localStorage.');
    return;
  }

  noEl.style.display = 'none';
  listEl.style.display = 'block';

  // Mettre à jour le compteur visible
  const countEl = document.getElementById('accountsCount');
  if(countEl) countEl.textContent = `Comptes trouvés : ${dedup.length}`;

  console.info(`[main] Comptes détectés: ${dedup.length}`, dedup);

  dedup.forEach(acc => {
    const card = document.createElement('div');
    card.className = 'card';

    const nm = document.createElement('p');
    nm.innerHTML = `<strong>Nom :</strong> ${escapeHtml(acc.name || '—')}`;

    const em = document.createElement('p');
    em.innerHTML = `<strong>Email :</strong> ${escapeHtml(acc.email || '—')}`;

    const src = document.createElement('p');
    src.className = 'small';
    src.textContent = `Source: ${acc.key}`;

    card.appendChild(nm);
    card.appendChild(em);
    card.appendChild(src);

    listEl.appendChild(card);
  });

  // Handler pour créer un compte test rapidement
  const createBtn = document.getElementById('createTest');
  if(createBtn){
    createBtn.addEventListener('click', ()=>{
      const sample = { name: 'Test User', email: `test${Date.now()}@example.local`, password: 'secret' };
      // stocker sous une clé unique
      const key = 'user_' + Date.now();
      localStorage.setItem(key, JSON.stringify(sample));
      alert('Compte test créé sous la clé ' + key + '. La page va se recharger pour afficher le compte.');
      location.reload();
    });
  }
});