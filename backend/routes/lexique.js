import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /api/lexique?q=&categorie=
router.get("/", async (req, res) => {
  const { q, categorie } = req.query;

  let conditions = [];
  let values = [];
  let i = 1;

  if (categorie) {
    conditions.push(`categorie = $${i}`);
    values.push(categorie);
    i++;
  }

  if (q) {
    conditions.push(`
      to_tsvector('french', terme || ' ' || definition) 
      @@ plainto_tsquery('french', $${i})
      OR terme ILIKE $${i + 1}
    `);
    values.push(q);
    values.push(`%${q}%`);
    i += 2;
  }

  const whereClause = conditions.length
    ? "WHERE " + conditions.join(" AND ")
    : "";

  try {
    const result = await pool.query(
      `SELECT * FROM lexique ${whereClause} ORDER BY terme ASC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/lexique/termes?categorie= → autocomplétion
router.get("/termes", async (req, res) => {
  const { categorie, q } = req.query;

  let conditions = [];
  let values = [];
  let i = 1;

  if (categorie) {
    conditions.push(`categorie = $${i}`);
    values.push(categorie);
    i++;
  }

  if (q) {
    conditions.push(`terme ILIKE $${i}`);
    values.push(`${q}%`);
    i++;
  }

  const whereClause = conditions.length
    ? "WHERE " + conditions.join(" AND ")
    : "";

  try {
    const result = await pool.query(
      `SELECT id, terme, categorie FROM lexique ${whereClause} ORDER BY terme ASC LIMIT 10`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;