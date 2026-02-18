import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  const q = req.query.q;

  if (!q || q.length < 2) {
    return res.json([]);
  }

  const sql = `
    SELECT
      id,
      nom_scientifique,
      nom_vernaculaire,
      ts_rank(
        to_tsvector('french',
          nom_scientifique || ' ' ||
          coalesce(nom_vernaculaire,'') || ' ' ||
          coalesce(famille,'') || ' ' ||
          coalesce(methode_consommation,'') || ' ' ||
          coalesce(proprietes_principales,'') || ' ' ||
          coalesce(resolution_probleme,'')
        ),
        plainto_tsquery('french', $1)
      ) AS score
    FROM plantes
    WHERE to_tsvector(
      'french',
      nom_scientifique || ' ' ||
      coalesce(nom_vernaculaire,'') || ' ' ||
      coalesce(famille,'') || ' ' ||
      coalesce(methode_consommation,'') || ' ' ||
      coalesce(proprietes_principales,'') || ' ' ||
      coalesce(resolution_probleme,'')
    )
    @@ plainto_tsquery('french', $1)
    ORDER BY score DESC
    LIMIT 10;
  `;

  const { rows } = await pool.query(sql, [q]);
  res.json(rows);
});

export default router;
