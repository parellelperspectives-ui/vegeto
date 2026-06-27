import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";

const sqlite = new SQLiteConnection(CapacitorSQLite);

const DB_NAME = "vegeto";
const DB_VERSION = 1;

let db = null;

export const initDB = async () => {
  if (!Capacitor.isNativePlatform()) return null;

  try {
    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

    if (isConn) {
      db = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      db = await sqlite.createConnection(
        DB_NAME,
        false,
        "no-encryption",
        DB_VERSION,
        false
      );
    }

    await db.open();
    await createTables();
    return db;
  } catch (err) {
    console.error("SQLite init error:", err);
    return null;
  }
};

const createTables = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS plantes (
      id INTEGER PRIMARY KEY,
      nom_scientifique TEXT,
      nom_vernaculaire TEXT,
      famille TEXT,
      methode_consommation TEXT,
      proprietes_principales TEXT,
      resolution_probleme TEXT,
      parties_comestibles TEXT,
      contre_indications TEXT,
      interactions_medicamenteuses TEXT,
      contre_indication_femmes_enceintes TEXT,
      contre_indication_enfant TEXT,
      image_filename TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS lexique (
      id INTEGER PRIMARY KEY,
      terme TEXT,
      definition TEXT,
      categorie TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sync_info (
      id INTEGER PRIMARY KEY,
      last_sync TEXT
    );
  `);
};

export const syncData = async (apiUrl) => {
  if (!Capacitor.isNativePlatform()) return;
  if (!db) await initDB();

  try {
    // Vérifie la connexion réseau
    const [plantesRes, lexiqueRes] = await Promise.all([
      fetch(`${apiUrl}/api/plantes?limit=500`),
      fetch(`${apiUrl}/api/lexique`)
    ]);

    if (!plantesRes.ok || !lexiqueRes.ok) throw new Error("Erreur réseau");

    const plantes = await plantesRes.json();
    const lexique = await lexiqueRes.json();

    // Vide les tables existantes
    await db.execute("DELETE FROM plantes;");
    await db.execute("DELETE FROM lexique;");

    // Insère les plantes
    for (const p of plantes) {
      await db.run(
        `INSERT INTO plantes VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          p.id,
          p.nom_scientifique,
          p.nom_vernaculaire,
          p.famille,
          p.methode_consommation,
          p.proprietes_principales,
          p.resolution_probleme,
          p.parties_comestibles,
          p.contre_indications,
          p.interactions_medicamenteuses,
          p.contre_indication_femmes_enceintes,
          p.contre_indication_enfant,
          p.image_filename
        ]
      );
    }

    // Insère le lexique
    for (const l of lexique) {
      await db.run(
        `INSERT INTO lexique VALUES (?,?,?,?)`,
        [l.id, l.terme, l.definition, l.categorie]
      );
    }

    // Enregistre la date de sync
    await db.execute("DELETE FROM sync_info;");
    await db.run(
      "INSERT INTO sync_info VALUES (1, ?)",
      [new Date().toISOString()]
    );

    console.log("Sync réussie :", plantes.length, "plantes,", lexique.length, "termes");
  } catch (err) {
    console.error("Sync error:", err);
  }
};

export const getPlantesLocales = async (q = "") => {
  if (!db) return null;
  const query = q
    ? `SELECT * FROM plantes WHERE nom_vernaculaire LIKE '%${q}%' 
       OR nom_scientifique LIKE '%${q}%' 
       OR proprietes_principales LIKE '%${q}%'
       OR resolution_probleme LIKE '%${q}%'
       ORDER BY nom_vernaculaire LIMIT 50`
    : `SELECT * FROM plantes ORDER BY nom_vernaculaire LIMIT 50`;

  const result = await db.query(query);
  return result.values;
};

export const getPlantByIdLocale = async (id) => {
  if (!db) return null;
  const result = await db.query(
    `SELECT * FROM plantes WHERE id = ?`, [id]
  );
  return result.values[0] || null;
};

export const getRandomPlanteLocale = async () => {
  if (!db) return null;
  const result = await db.query(
    `SELECT * FROM plantes ORDER BY RANDOM() LIMIT 1`
  );
  return result.values[0] || null;
};

export const getLexiqueLocal = async (q = "", categorie = "") => {
  if (!db) return null;
  let query = `SELECT * FROM lexique WHERE 1=1`;
  if (q) query += ` AND (terme LIKE '%${q}%' OR definition LIKE '%${q}%')`;
  if (categorie && categorie !== "tous") query += ` AND categorie = '${categorie}'`;
  query += ` ORDER BY terme`;

  const result = await db.query(query);
  return result.values;
};

export const getDB = () => db;