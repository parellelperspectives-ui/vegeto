import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import searchRoutes from "./routes/search.js";
import optionsRoutes from "./routes/options.js";
import plantesRoutes from "./routes/plantes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", searchRoutes);
// Routes
app.use("/api/plantes", plantesRoutes);
app.use("/api/options", optionsRoutes); 

app.listen(process.env.PORT, () => {
  console.log(`✅ API running on http://localhost:${process.env.PORT}`);
});
