import express from "express";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import propertiesRouter from "./routes/properties.js";
import loansRouter from "./routes/loans.js";
import maintenanceRouter from "./routes/maintenance.js";
import legalRouter from "./routes/legal.js";
import expensesRouter from "./routes/expenses.js";
import salesRouter from "./routes/sales.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/properties", propertiesRouter);
app.use("/api/loans", loansRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/legal", legalRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/sales", salesRouter);

app.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

const frontendDist = join(__dirname, "..", "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get("*", (_req, res) => {
  res.sendFile(join(frontendDist, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
