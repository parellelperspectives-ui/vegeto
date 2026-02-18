import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "plantes_db",
  user: "postgres",
  password: "db-plante-2025"
});

const columnsToNormalize = [
  "methode_consommation",
  "proprietes_principales",
  "resolution_probleme",
  "parties_comestibles"
];

async function normalize() {
  try {
    for (const column of columnsToNormalize) {
      console.log(`🔧 Normalisation de ${column}...`);

      await pool.query(`
        UPDATE plantes
        SET ${column} = regexp_replace(${column}, ',\\s*', '|', 'g')
        WHERE ${column} IS NOT NULL;
      `);
    }

    console.log("✅ Normalisation terminée");
  } catch (err) {
    console.error("❌ Erreur :", err);
  } finally {
    await pool.end();
  }
}

normalize();
