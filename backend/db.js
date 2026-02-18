import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "TON_MOT_DE_PASSE",
  port: 5432
});

export default pool;