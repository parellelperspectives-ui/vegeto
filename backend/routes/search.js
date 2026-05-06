import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { q, methodes, proprietes, problemes } = req.body;

  let conditions = [];
  let values = [];
  let i = 1;

  // Recherche texte sur nom vernaculaire uniquement
  if (q && q.trim() !== "") {
    conditions.push(`nom_vernaculaire ILIKE $${i}`);
    values.push(`%${q}%`);
    i++;
  }

  // Méthodes
  if (methodes?.length) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM unnest(string_to_array(methode_consommation, '|')) m
        WHERE trim(m) = ANY($${i})
      )
    `);
    values.push(methodes);
    i++;
  }

  // Propriétés
  if (proprietes?.length) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM unnest(string_to_array(proprietes_principales, '|')) p
        WHERE trim(p) = ANY($${i})
      )
    `);
    values.push(proprietes);
    i++;
  }

  // Problèmes
  if (problemes?.length) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM unnest(string_to_array(resolution_probleme, '|')) r
        WHERE trim(r) = ANY($${i})
      )
    `);
    values.push(problemes);
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
    console.error("Erreur recherche multicritère :", err);
    res.status(500).json({ error: "Erreur recherche" });
  }
});

export default router;