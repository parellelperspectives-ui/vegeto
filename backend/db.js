import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        user: "postgres",
        host: "localhost",
        database: "postgres",
        password: "TON_MOT_DE_PASSE",
        port: 5432
      }
);

export default pool;