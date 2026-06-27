import express from "express";
import pool from "../db.js";
const { q, methode, probleme, limit } = req.query;

const router = express.Router();

/**
 * Recherche multi-critères
 * /api/plantes?q=&methode=&propriete=&probleme=
 */
router.get("/", async (req, res) => {
  const { q, methode, propriete, probleme } = req.query;

  let conditions = [];
  let values = [];
  let i = 1;

  // 🔍 Recherche UNIQUEMENT sur le nom vernaculaire
  if (q) {
  conditions.push(`
    (
      to_tsvector('french',
        coalesce(nom_vernaculaire, '') || ' ' ||
        coalesce(nom_scientifique, '') || ' ' ||
        coalesce(methode_consommation, '') || ' ' ||
        coalesce(resolution_probleme, '') || ' ' ||
        coalesce(proprietes_principales, '')
      ) @@ plainto_tsquery('french', $${i})
      OR
      (
        coalesce(nom_vernaculaire, '') || ' ' ||
        coalesce(nom_scientifique, '')
      ) ILIKE $${i + 1}
    )
  `);
  values.push(q);
  values.push(`%${q}%`);
  i += 2;
}
  if (methode) {
    conditions.push(`methode_consommation ILIKE $${i}`);
    values.push(`%${methode}%`);
    i++;
  }

  if (propriete) {
    conditions.push(`proprietes_principales ILIKE $${i}`);
    values.push(`%${propriete}%`);
    i++;
  }

  if (probleme) {
    conditions.push(`resolution_probleme ILIKE $${i}`);
    values.push(`%${probleme}%`);
    i++;
  }

  const whereClause = conditions.length
    ? "WHERE " + conditions.join(" AND ")
    : "";

  const query = `
    SELECT * FROM plantes
    ${whereClause}
    ORDER BY nom_vernaculaire
    LIMIT ${limit ? parseInt(limit) : 50}
  `;

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// GET /api/plantes/random → plante aléatoire
router.get("/random", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM plantes ORDER BY RANDOM() LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucune plante en base" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/plantes/methodes → valeurs distinctes
router.get("/methodes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT methode_consommation FROM plantes WHERE methode_consommation IS NOT NULL ORDER BY methode_consommation"
    );
    res.json(result.rows.map(r => r.methode_consommation));
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/plantes/problemes → valeurs distinctes
router.get("/problemes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT resolution_probleme FROM plantes WHERE resolution_probleme IS NOT NULL ORDER BY resolution_probleme"
    );
    res.json(result.rows.map(r => r.resolution_probleme));
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/plantes/problemes-par-methode?methode=infusion
router.get("/problemes-par-methode", async (req, res) => {
  const { methode } = req.query;

  try {
    const query = methode
      ? `SELECT DISTINCT resolution_probleme 
         FROM plantes 
         WHERE methode_consommation ILIKE $1
         AND resolution_probleme IS NOT NULL`
      : `SELECT DISTINCT resolution_probleme 
         FROM plantes 
         WHERE resolution_probleme IS NOT NULL`;

    const values = methode ? [`%${methode}%`] : [];
    const result = await pool.query(query, values);

    // On extrait tous les problèmes individuels depuis les valeurs composites
    const tousLesProblemes = result.rows
      .flatMap(r => r.resolution_probleme.split(",").map(p => p.trim().toLowerCase()))
      .filter(Boolean);

    const uniques = [...new Set(tousLesProblemes)].sort();
    res.json(uniques);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/plantes/:id → fiche plante
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM plantes WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plante introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


export default router;
