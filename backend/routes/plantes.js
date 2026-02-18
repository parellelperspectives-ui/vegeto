import express from "express";
import pool from "../db.js";

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
    conditions.push(`nom_vernaculaire ILIKE $${i}`);
    values.push(`%${q}%`);
    i++;
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
    SELECT *
    FROM plantes
    ${whereClause}
    ORDER BY nom_vernaculaire
    LIMIT 50
  `;

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
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
