import fs from 'fs';
import csv from 'csv-parser';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const csvFilePath = './data/plantes_db.csv'; // chemin vers ton CSV

async function importCSV() {
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`📥 ${results.length} lignes trouvées. Début de l'import...`);

      for (const row of results) {
        const query = `
          INSERT INTO plantes(
            nom_scientifique,
            nom_vernaculaire,
            famille,
            methode_consommation,
            proprietes_principales,
            resolution_probleme,
            parties_comestibles,
            contre_indication,
            interactions_medicamenteuses,
            contre_indication_femmes_enceintes,
            contre_indication_enfant
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          ON CONFLICT DO NOTHING
        `;

        const values = [
          row.nom_scientifique,
          row.nom_vernaculaire,
          row.famille,
          row.methode_consommation,
          row.proprietes_principales,
          row.resolution_probleme,
          row.parties_comestibles,
          row.contre_indication,
          row.interactions_medicamenteuses,
          row.contre_indication_femmes_enceintes === 'true',
          row.contre_indication_enfant === 'true'
        ];

        try {
          await pool.query(query, values);
        } catch (err) {
          console.error('❌ Erreur ligne:', row, err.message);
        }
      }

      console.log('✅ Import terminé.');
      await pool.end();
    });
}

importCSV();
