import express from "express";
import cors from "cors";
import plantesRoutes from "./routes/plantes.js";
import pool from "./db.js";
import autocompleteRoutes from "./routes/autocomplete.js";
import searchRoutes from "./routes/search.js";
import optionsRoutes from "./routes/options.js";
import lexiqueRouter from "./routes/lexique.js";
import identifyRouter from "./routes/identify.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://localhost",
    "https://parallel-perspectives.com",
    "https://www.parallel-perspectives.com",
    /\.railway\.app$/
  ]
}));

app.use(express.json());

app.use("/api/plantes", plantesRoutes);
app.use("/api/autocomplete", autocompleteRoutes);
app.use("/api/options", optionsRoutes);
app.use("/api/lexique", lexiqueRouter);
app.use("/api/search", searchRoutes);
app.use("/api/identify", identifyRouter);

const PORT = process.env.PORT || 3001;

try {
  const info = await pool.query(`
    SELECT current_database(), inet_server_port()
  `);
  console.log("DB INFO:", info.rows[0]);
} catch (err) {
  console.error("DB connection error:", err.message);
}

app.listen(PORT, () => {
  console.log(`🌿 API backend sur le port ${PORT}`);
});