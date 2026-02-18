import express from "express";
import pool from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { q, methodes, problemes } = req.body;

  let conditions = [];
  let values = [];
  let i = 1;

  if (q) {
    conditions.push(`
      (
        nom_scientifique ILIKE $${i}
        OR nom_vernaculaire ILIKE $${i}
        OR famille ILIKE $${i}
      )
    `);
    values.push(`%${q}%`);
    i++;
  }

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

  if (problemes?.length) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM unnest(string_to_array(resolution_probleme, '|')) p
        WHERE trim(p) = ANY($${i})
      )
    `);
    values.push(problemes);
    i++;
  }

  const whereClause = conditions.length
    ? "WHERE " + conditions.join(" AND ")
    : "";

  const query = `
    SELECT id, nom_vernaculaire, nom_scientifique, famille
    FROM plantes
    ${whereClause}
    ORDER BY nom_vernaculaire
    LIMIT 50
  `;

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur recherche:", err);
    res.status(500).json({ error: "Erreur recherche" });
  }
});

export default router;
