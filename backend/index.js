import express from "express";
import cors from "cors";
import plantesRoutes from "./routes/plantes.js";
import pool from "./db.js";
import autocompleteRoutes from "./routes/autocomplete.js";
import searchRoutes from "./routes/search.js";
import optionsRoutes from "./routes/options.js";

const app = express();

app.use(cors({
  origin: "http://localhost:3000"
}));
app.use(express.json());

app.use("/api/plantes", plantesRoutes);
app.use("/api/autocomplete", autocompleteRoutes);
app.use("/api/options", optionsRoutes)

const PORT = 3001;
const info = await pool.query(`
  SELECT
    current_database(),
    inet_server_port(),
    current_setting('data_directory') AS data_directory
`);

console.log("DB INFO NODE:", info.rows[0]);
app.listen(PORT, () => {
  console.log(`🌿 API backend sur http://localhost:${PORT}`);
});

app.use("/api/search", searchRoutes);





