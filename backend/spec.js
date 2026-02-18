// STACK PROPOSÉ
// Frontend : React + TypeScript + Tailwind
// Backend : Node.js (Express ou NestJS)
// DB : CSV importé vers PostgreSQL ou SQLite
// Recherche : PostgreSQL Full‑Text Search ou Meilisearch

/* ============================
   SCHÉMA DE DONNÉES (SQL)
============================ */

/*
CREATE TABLE plantes (
  id SERIAL PRIMARY KEY,
  nom_scientifique TEXT,
  nom_vernaculaire TEXT,
  famille TEXT,
  methode_consommation TEXT,
  proprietes_principales TEXT,
  resolution_probleme TEXT,
  parties_comestibles TEXT,
  contre_indication TEXT,
  interactions_medicamenteuses TEXT,
  contre_indication_femmes_enceintes BOOLEAN,
  contre_indication_enfant BOOLEAN
);
*/

/* ============================
   INDEX POUR RECHERCHE
============================ */

/*
CREATE INDEX plantes_search_idx ON plantes USING GIN (
  to_tsvector('french',
    coalesce(nom_scientifique,'') || ' ' ||
    coalesce(nom_vernaculaire,'') || ' ' ||
    coalesce(famille,'') || ' ' ||
    coalesce(methode_consommation,'') || ' ' ||
    coalesce(proprietes_principales,'') || ' ' ||
    coalesce(resolution_probleme,'')
  )
);
*/

/* ============================
   API BACKEND (Express)
============================ */

// GET /search?q=menthe
// Retourne suggestions auto‑complétion

/*
app.get('/search', async (req, res) => {
  const q = req.query.q;
  const results = await db.query(`
    SELECT id, nom_scientifique, nom_vernaculaire
    FROM plantes
    WHERE to_tsvector('french', nom_scientifique || ' ' || nom_vernaculaire || ' ' || famille || ' ' || methode_consommation || ' ' || proprietes_principales || ' ' || resolution_probleme)
    @@ plainto_tsquery('french', $1)
    LIMIT 10
  `, [q]);
  res.json(results.rows);
});
*/

// GET /plante/:id → fiche complète

/* ============================
   FRONTEND – HEADER SEARCH
============================ */

import { useState } from "react";

export default function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleChange = async (value: string) => {
    setQuery(value);
    if (value.length < 2) return;

    const res = await fetch(`/search?q=${value}`);
    const data = await res.json();
    setResults(data);
  };

  return (
    <header className="p-4 shadow-md bg-white">
      <input
        type="text"
        placeholder="Rechercher une plante, une propriété, un usage…"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full p-3 border rounded-xl"
      />

      {results.length > 0 && (
        <ul className="mt-2 bg-white border rounded-xl shadow">
          {results.map((r) => (
            <li
              key={r.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {r.nom_vernaculaire} <span className="italic text-sm">({r.nom_scientifique})</span>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

/* ============================
   LOGIQUE D’AFFICHAGE
============================ */

// Si correspondance exacte sur nom_scientifique ou nom_vernaculaire → page FICHE PLANTE
// Sinon → page LISTE DE RÉSULTATS

/* ============================
   PAGE FICHE PLANTE
============================ */

/*
Nom scientifique
Nom vernaculaire
Famille

Méthodes de consommation
Propriétés principales
Résout quels problèmes

Parties comestibles

⚠️ Contre‑indications
⚠️ Interactions médicamenteuses
⚠️ Femmes enceintes
⚠️ Enfants
*/

/* ============================
   BONUS (RECOMMANDÉ)
============================ */

// ✔ Normaliser les propriétés (digestif, calmant, anti‑inflammatoire…)
// ✔ Ajouter des tags (array) pour recherche plus rapide
// ✔ Meilisearch / Typesense pour auto‑complétion instantanée
// ✔ Disclaimer médical obligatoire
