// backend/routes/options.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const cols = [
      "methode_consommation",
      "proprietes_principales",
      "resolution_probleme",
    ];
    const result = {};

    for (let col of cols) {
      const { rows } = await pool.query(
        `SELECT DISTINCT ${col} 
         FROM plantes 
         WHERE ${col} IS NOT NULL AND ${col} <> '-' 
         ORDER BY ${col}`
      );

      const uniqueVals = new Set();

      rows.forEach((r) => {
        if (r[col]) {
          // ✅ Split sur pipe |, point-virgule ; ou virgule ,
          r[col].split(/[\|;,]/).forEach((v) => {
            const trimmed = v.trim();
            if (trimmed) uniqueVals.add(trimmed);
          });
        }
      });

      // Tri alphabétique
      result[col] = Array.from(uniqueVals).sort();
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
