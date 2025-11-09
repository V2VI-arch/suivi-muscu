// script.js — gère l'ouverture du modal d'inscription et sauvegarde dans localStorage
const openBtn = document.getElementById('openSignup');
const modal = document.getElementById('signupModal');
const closeBtn = document.getElementById('closeSignup');
const form = document.getElementById('signupForm');

// header sur account.html peut aussi ouvrir le modal (si présent)
const openBtnsHeader = document.querySelectorAll('#openSignupHeader');
openBtnsHeader.forEach(b=>b && b.addEventListener('click', ()=>{ window.location.href='index.html'; setTimeout(()=>document.getElementById('openSignup')?.click(),100); }));

openBtn && openBtn.addEventListener('click', ()=>{
  modal.setAttribute('aria-hidden','false');
  document.getElementById('name').focus();
});
closeBtn && closeBtn.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.setAttribute('aria-hidden','true'); });

form && form.addEventListener('submit', (e)=>{
  e.preventDefault();
  
  // Réinitialiser les états d'erreur
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    input.setAttribute('aria-invalid', 'false');
    const errorId = `${input.id}-error`;
    const existingError = document.getElementById(errorId);
    if (existingError) existingError.remove();
  });

  // Validation
  let isValid = true;
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (name.length < 2) {
    showError('name', 'Le nom doit contenir au moins 2 caractères');
    isValid = false;
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    showError('email', 'Veuillez entrer une adresse email valide');
    isValid = false;
  }

  if (password.length < 6) {
    showError('password', 'Le mot de passe doit contenir au moins 6 caractères');
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  const user = { name, email, password };
  localStorage.setItem('user', JSON.stringify(user));

  modal.setAttribute('aria-hidden','true');
  
  // Annoncer le succès aux lecteurs d'écran
  const successMessage = document.createElement('div');
  successMessage.setAttribute('role', 'status');
  successMessage.setAttribute('aria-live', 'polite');
  successMessage.textContent = 'Inscription réussie — vous pouvez maintenant aller sur "Mon compte".';
  document.body.appendChild(successMessage);
  
  setTimeout(() => successMessage.remove(), 5000);
});

// Fonction pour afficher les erreurs de validation
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorId = `${inputId}-error`;
  const errorSpan = document.createElement('span');
  errorSpan.id = errorId;
  errorSpan.className = 'error-text';
  errorSpan.textContent = message;
  
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-errormessage', errorId);
  input.parentNode.appendChild(errorSpan);
}

// Gestion du focus dans le modal
modal && modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modal.setAttribute('aria-hidden', 'true');
  }
});

// Si utilisateur déjà inscrit, changer le texte du bouton
const existing = localStorage.getItem('user');
if(existing){
  openBtn && (openBtn.textContent = 'Inscrit');
}
