# Site démo - Inscription et Mon compte (localStorage)

Ce petit projet contient deux pages statiques : `index.html` et `account.html`.

Fonctionnalités :
- Header avec bouton d'Inscription qui ouvre un modal.
- Sauvegarde du compte dans `localStorage` côté client.
- Page `Mon compte` où l'on peut modifier ou supprimer (déconnexion) le compte.

Fichiers :
- `index.html` - page d'accueil et modal d'inscription
- `account.html` - page mon compte pour visualiser/modifier
- `styles.css` - styles
- `script.js` - logique d'inscription
- `account.js` - logique de la page compte

Nouvelle page ajoutée:
- `main.html` - page qui liste tous les comptes détectés dans le navigateur (parcourant les clés de `localStorage` et affichant les objets contenant `name`/`email`). Utile pour tester les comptes présents localement.

Un petit script `main.js` accompagne la page pour parser et afficher les comptes.

Comment tester (Windows PowerShell) :
Lancer un serveur local (par exemple Python) depuis le dossier du projet :

```powershell
# si Python 3 est installé
python -m http.server 8000
# puis ouvrir http://localhost:8000 dans le navigateur
```

Notes :
- C'est une implémentation front-end uniquement pour démonstration. Ne stockez pas de mots de passe en clair en production.
- Améliorations possibles : validation plus poussée, gestion d'utilisateurs multiples, backend avec authentification.
