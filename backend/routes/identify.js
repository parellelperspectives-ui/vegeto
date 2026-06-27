import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import pool from "../db.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucune image fournie" });
    }

    // Envoi à PlantNet
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append("images", blob, req.file.originalname);
    formData.append("organs", "leaf");

    const plantnetRes = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}&lang=fr`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!plantnetRes.ok) {
      throw new Error(`PlantNet error: ${plantnetRes.status}`);
    }

    const plantnetData = await plantnetRes.json();

    // Récupère les 3 meilleurs résultats
    const topResults = plantnetData.results.slice(0, 3);

    // Pour chaque résultat cherche dans la base Vegeto
    const enrichedResults = await Promise.all(
      topResults.map(async (result) => {
        const scientificName = result.species.scientificNameWithoutAuthor;
        const genus = result.species.genus.scientificNameWithoutAuthor;

        // Cherche d'abord par nom scientifique exact puis par genre
        const dbResult = await pool.query(
          `SELECT id, nom_vernaculaire, nom_scientifique, famille, 
                  proprietes_principales, methode_consommation, image_filename
           FROM plantes 
           WHERE nom_scientifique ILIKE $1 
              OR nom_scientifique ILIKE $2
           LIMIT 1`,
          [`%${scientificName}%`, `%${genus}%`]
        );

        return {
          score: result.score,
          scientificName: result.species.scientificName,
          commonNames: result.species.commonNames,
          famille: result.species.family.scientificNameWithoutAuthor,
          planteVegeto: dbResult.rows[0] || null,
        };
      })
    );

    res.json({
      bestMatch: plantnetData.bestMatch,
      results: enrichedResults,
    });
  } catch (err) {
    console.error("Erreur identify :", err);
    res.status(500).json({ error: "Erreur identification" });
  }
});

export default router;