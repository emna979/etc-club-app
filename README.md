# ETC Junior Entreprise — App du club

Application du club (auth, calendrier, règlement/code électoral, chat général + bureau
avec envoi de photos/documents), connectée à un vrai backend :

- **Frontend** : React + Vite, connecté à **Firebase** (Auth + Firestore)
- **Backend** : Node.js/Express, gère l'upload des photos et documents du chat

## 1. Lancer en local

### Backend (à démarrer en premier)
```bash
cd backend
npm install
npm run dev
```
Le backend tourne sur `http://localhost:4000`.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Ouvre l'URL affichée (en général `http://localhost:5173`).

## 2. Avant la première utilisation — sécuriser Firestore

Va dans la console Firebase → **Firestore Database → Règles**, et colle le contenu
du fichier `firestore.rules` à la racine de ce projet, puis publie.

Sans ça, la base reste en mode test (ouverte à tout le monde) — à ne jamais laisser
tel quel en production.

## 3. Créer le premier compte "Bureau"

À l'inscription, tout nouveau compte est créé avec le rôle `membre` (c'est voulu,
personne ne doit pouvoir s'auto-attribuer le rôle `bureau`). Pour promouvoir un
membre au bureau exécutif :

1. Console Firebase → **Firestore Database → Données**
2. Collection `users` → ouvre le document du membre concerné
3. Change le champ `role` de `"membre"` à `"bureau"`
4. Le membre doit se reconnecter (ou recharger l'app) pour que ça prenne effet

## 4. Déployer pour de vrai (PWA, accessible par lien)

### Backend
Déploie le dossier `backend/` sur un hébergeur gratuit (Render, Railway, Fly.io…).
Note bien l'URL publique obtenue (ex. `https://etc-backend.onrender.com`).

⚠️ Certains hébergeurs gratuits "endorment" le service après inactivité (le premier
message après une pause peut mettre quelques secondes à répondre) et peuvent effacer
le dossier `uploads/` au redémarrage — vérifie les conditions actuelles de l'hébergeur
choisi avant de compter dessus à long terme.

### Frontend
1. Dans `frontend/.env`, remplace `VITE_BACKEND_URL` par l'URL de ton backend déployé.
2. Build : `npm run build` (génère le dossier `frontend/dist`).
3. Déploie `dist/` sur Vercel, Netlify ou Firebase Hosting (gratuit, sans carte).
4. Le lien obtenu (ex. `https://etc-club.vercel.app`) est celui à partager aux
   membres — ouvert sur mobile, ils peuvent l'ajouter à leur écran d'accueil.

## Ce qui n'est pas encore fait (pistes pour la suite)

- Manifest PWA + icônes (`manifest.json`, `icon-192.png`) pour un vrai "ajouter à
  l'écran d'accueil" — actuellement juste référencé dans `index.html`.
- Pagination des messages de chat (actuellement les 200 derniers messages sont chargés).
- Suppression/modification des événements et messages.
- Notifications (nouveau message, nouvel événement).
