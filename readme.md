# INSTALL
# # start new project with webpack

npm init -y
npm i webpack
nvm use 18.13.0
npm i react
npm install tailwindcss
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin
update package.json

# node version to use:
nvm use 18.13.0
launch project : npx webpack serve
or npm start

# access to db
psql postgres
exit > \q

# launch project

cd backend: node index.js
cd frontend: npm start

# Create table

CREATE TABLE plantes (
  id SERIAL PRIMARY KEY,
  nom_scientifique TEXT NOT NULL,
  nom_vernaculaire TEXT,
  famille TEXT,
  methode_consommation TEXT,
  proprietes_principales TEXT,
  resolution_probleme TEXT,
  parties_comestibles TEXT,
  contre_indications TEXT,
  interactions_medicamenteuses TEXT,
  contre_indication_femmes_enceintes TEXT,
  contre_indication_enfant TEXT
);


\copy plantes (
  nom_scientifique,
  nom_vernaculaire,
  famille,
  methode_consommation,
  proprietes_principales,
  resolution_probleme,
  parties_comestibles,
  contre_indications,
  interactions_medicamenteuses,
  contre_indication_femmes_enceintes,
  contre_indication_enfant
)
FROM 'data/plantes_postgres.csv'
WITH (
  FORMAT csv,
  HEADER true,
  DELIMITER ';',
  QUOTE '"',
  ESCAPE '"'
);


# 🌿 Vegeto — Plant Knowledge & Search App

Vegeto is a full-stack web application that allows users to search, explore, and learn about medicinal and edible plants.

It provides a simple and intuitive interface to:
- 🔍 Search plants by name
- 🌱 Explore plant properties and uses
- 🧠 Filter plants using multi-criteria search
- 📖 View detailed plant profiles

---

## 🚀 Features

### 🔍 Smart Search
- Search plants using **vernacular names**
- Real-time suggestions (autocomplete)
- Keyboard navigation (↑ ↓ Enter)

### 🌿 Plant Profile (Fiche Plante)
- Scientific and vernacular names
- Family
- Consumption methods
- Health-related uses (problems addressed)
- Edible parts
- Contraindications
- Drug interactions
- Specific warnings (children, pregnancy)

### 🎯 Multi-Criteria Filtering
- Filter plants by:
  - Method of consumption (e.g. infusion, decoction)
  - Health problems addressed
- Cross-filtering (AND logic)

### 🖼️ Image Support (in progress)
- Each plant can be associated with an image
- Images stored locally and linked via database

---

## 🏗️ Tech Stack

### Frontend
- React (Create React App)
- Tailwind CSS
- Fetch API

### Backend
- Node.js
- Express.js
- PostgreSQL

---

## 📁 Project Structure


vegeto/
├── backend/
│ ├── routes/
│ │ ├── plantes.js
│ │ ├── search.js
│ │ ├── autocomplete.js
│ │ └── options.js
│ ├── db.js
│ └── index.js
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── SearchBar.jsx
│ │ │ └── PlanteFiche.jsx
│ │ ├── pages/
│ │ │ └── Home.jsx
│ │ └── index.css
│ └── package.json
│
└── README.md


---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd vegeto
2. Backend setup
cd backend
npm install

Configure your PostgreSQL database in db.js.

Start the server:

node index.js

👉 Backend runs on:
http://localhost:3001

3. Frontend setup
cd frontend
npm install
npm start

👉 Frontend runs on:
http://localhost:3000

🔌 API Endpoints
🔍 Search plants
GET /api/plantes?q=menthe

Search by vernacular name.

📖 Get plant by ID
GET /api/plantes/:id

Returns full plant details.

⚡ Autocomplete
GET /api/autocomplete?q=men

Returns suggestions (vernacular names only).

🎯 Multi-criteria search
POST /api/search

Body example:

{
  "q": "menthe",
  "methodes": ["infusion"],
  "problemes": ["digestion"]
}
🧩 Filter options
GET /api/options

Returns unique values for filters.

🧠 Design Choices
Search limited to vernacular names for better UX
Backend handles filtering logic
Frontend focuses on interactivity and display
Plant data stored in PostgreSQL
Images linked via database (not filename logic)
🚧 Roadmap
 Improve multi-criteria search reliability
 Add plant images display
 Add favorites / bookmarking
 Advanced search (properties, compounds)
 Mobile UI optimization
 Deployment (Docker / Vercel / Railway)
🤝 Contributing

This project is currently in active development.
Feel free to suggest improvements or features.

📜 License

MIT License


---
