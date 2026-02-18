import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") return res.json([]);

    const { rows } = await pool.query(
      `
      SELECT id, nom_vernaculaire
      FROM plantes
      WHERE nom_vernaculaire ILIKE $1
      ORDER BY nom_vernaculaire
      LIMIT 10
      `,
      [`%${q}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
