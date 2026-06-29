# 🌿 Vegeto

Application web et mobile de recherche de plantes comestibles et médicinales en France.

## Stack technique

**Frontend** : React (CRA) + Tailwind CSS + Capacitor (Android)  
**Backend** : Node.js + Express  
**Base de données** : PostgreSQL (Railway en production) + SQLite local (Android hors ligne)  
**APIs tierces** : PlantNet (identification photo), OpenStreetMap/Overpass (herboristeries)

---

## Structure du projet

```
vegeto/
├── backend/          → API Node.js/Express
│   ├── routes/
│   │   ├── plantes.js
│   │   ├── lexique.js
│   │   ├── identify.js
│   │   ├── autocomplete.js
│   │   ├── search.js
│   │   └── options.js
│   ├── db.js
│   └── index.js
└── frontend/         → React + Capacitor
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── PlanteFiche.jsx
    │   │   ├── MultiFilters.jsx
    │   │   ├── Herboristeries.jsx
    │   │   ├── IdentifyPlante.jsx
    │   │   └── DisclaimerModal.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Plante.jsx
    │   │   └── Lexique.jsx
    │   ├── services/
    │   │   └── db.js       → SQLite offline
    │   └── config.js       → URL API
    └── android/            → projet Android Studio
```

---

## Installation locale

### Prérequis

- Node.js v18+
- PostgreSQL
- Android Studio (pour le build Android)
- JDK 17

### Backend

```bash
cd backend
npm install
```

Crée un fichier `backend/.env` :

```
DATABASE_URL=postgresql://postgres:motdepasse@localhost:5432/postgres
PORT=3001
PLANTNET_API_KEY=ta_cle_plantnet
```

Lance le backend :

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Crée un fichier `frontend/.env` :

```
REACT_APP_API_URL=http://localhost:3001
```

Lance le frontend :

```bash
npm start
```

---

## Base de données

### Schéma principal

```sql
CREATE TABLE plantes (
  id SERIAL PRIMARY KEY,
  nom_scientifique TEXT,
  nom_vernaculaire TEXT,
  famille TEXT,
  methode_consommation TEXT,
  proprietes_principales TEXT,
  resolution_probleme TEXT,
  parties_comestibles TEXT,
  contre_indications TEXT,
  interactions_medicamenteuses TEXT,
  contre_indication_femmes_enceintes TEXT,
  contre_indication_enfant TEXT,
  image_filename TEXT
);

CREATE TABLE lexique (
  id SERIAL PRIMARY KEY,
  terme TEXT NOT NULL,
  definition TEXT NOT NULL,
  categorie TEXT NOT NULL CHECK (categorie IN ('propriete', 'probleme', 'methode'))
);
```

### Index full-text

```sql
-- Index full-text français
CREATE INDEX plantes_fts_idx ON plantes USING GIN (
  to_tsvector('french',
    coalesce(nom_vernaculaire, '') || ' ' ||
    coalesce(nom_scientifique, '') || ' ' ||
    coalesce(methode_consommation, '') || ' ' ||
    coalesce(resolution_probleme, '') || ' ' ||
    coalesce(proprietes_principales, '')
  )
);

-- Index trigrammes pour la tolérance aux fautes
CREATE EXTENSION pg_trgm;
CREATE INDEX plantes_trgm_idx ON plantes USING GIN (
  (coalesce(nom_vernaculaire, '') || ' ' || coalesce(nom_scientifique, '')) gin_trgm_ops
);

-- Index lexique
CREATE INDEX lexique_search_idx ON lexique USING GIN (
  to_tsvector('french', terme || ' ' || definition)
);
```

---

## Fonctionnalités

### v1
- Recherche full-text sur tous les champs (nom, propriétés, méthodes, problèmes)
- Filtres multicritères : méthode de consommation + problème traité
- Filtres contextuels (les problèmes se filtrent selon la méthode choisie)
- Fiche plante complète avec image
- Plante aléatoire au chargement
- Lexique de 196 termes botaniques et médicaux avec autocomplétion
- Carte des herboristeries, magasins bio et pharmacies (OpenStreetMap)
- Géolocalisation avec fallback manuel par ville
- Header responsive avec menu hamburger mobile
- Disclaimer médical (modal au premier lancement + footer permanent)

### v2
- **Identification de plantes par photo** via PlantNet API
  - Capture photo ou import depuis la galerie
  - Score de confiance par résultat
  - Lien direct vers la fiche Vegeto si la plante est référencée
- **Mode hors ligne Android**
  - Sync automatique au démarrage (118 plantes + 196 termes)
  - SQLite local via @capacitor-community/sqlite
  - Recherche et lexique fonctionnels sans réseau
  - Bandeau indicateur mode hors ligne

---

## Déploiement

### Backend — Railway

1. Connecte-toi sur [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo → sélectionne `vegeto`
3. Settings → Root Directory → `backend`
4. Settings → Deploy → Start Command → `node index.js`
5. Settings → Networking → Generate Domain → port `8080`
6. New → Database → PostgreSQL
7. Variables → vérifie que `DATABASE_URL` est présente
8. Ajoute manuellement `PLANTNET_API_KEY`

Pour mettre à jour : push sur GitHub → Railway redéploie automatiquement.

### Frontend web — parallel-perspectives.com

Build :

```bash
cd frontend
npm run build:web
```

Upload le contenu de `build/` dans `/app/vegeto/` sur le serveur.

Le fichier `.htaccess` dans `/app/vegeto/` :

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## Build Android

### Première fois

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
```

### À chaque mise à jour

```bash
cd frontend
npm run build:android
npx cap sync android
```

### Ouvrir dans Android Studio

```bash
npx cap open android
```

### Générer le .aab pour le Play Store

Dans Android Studio :
```
Build → Generate Signed Bundle/APK
→ Android App Bundle
→ Keystore : /Users/Marc/Documents/keystores/vegeto.jks
→ Alias : vegeto
→ Variant : release
→ Finish
```

Le fichier généré : `frontend/android/app/release/app-release.aab`

### Incrémenter la version

Dans `android/app/build.gradle` :

```gradle
versionCode 3        // à incrémenter à chaque release
versionName "2.1.0"  // version affichée sur le Play Store
```

---

## Scripts npm (frontend)

```bash
npm start              # développement local
npm run build          # build générique
npm run build:web      # build pour parallel-perspectives.com
npm run build:android  # build pour Capacitor/Android
```

---

## Variables d'environnement

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL (Railway en prod) |
| `PORT` | Port du serveur (Railway l'injecte automatiquement) |
| `PLANTNET_API_KEY` | Clé API PlantNet |

### Frontend (.env)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | URL du backend |

---

## APIs

| Route | Description |
|-------|-------------|
| `GET /api/plantes` | Recherche avec filtres (q, methode, probleme, limit) |
| `GET /api/plantes/random` | Plante aléatoire |
| `GET /api/plantes/:id` | Fiche complète |
| `GET /api/plantes/problemes-par-methode` | Problèmes filtrés par méthode |
| `GET /api/lexique` | Recherche dans le lexique |
| `GET /api/lexique/termes` | Autocomplétion lexique |
| `POST /api/identify` | Identification photo via PlantNet |

---

## Avertissement médical

Les informations fournies par Vegeto ont un caractère strictement informatif et éducatif. Elles ne constituent en aucun cas un avis médical, un diagnostic ou une prescription thérapeutique. Consultez toujours un professionnel de santé avant toute utilisation thérapeutique d'une plante.

---

## Liens

- **App web** : [parallel-perspectives.com/app/vegeto](https://parallel-perspectives.com/app/vegeto)
- **Backend** : [vegeto-production.up.railway.app](https://vegeto-production.up.railway.app)
- **Google Play Console** : [play.google.com/console](https://play.google.com/console)
- **PlantNet API** : [my.plantnet.org](https://my.plantnet.org)
- **Politique de confidentialité** : [parallel-perspectives.com/politique-de-confidentialite-vegeto](https://parallel-perspectives.com/politique-de-confidentialite-vegeto)