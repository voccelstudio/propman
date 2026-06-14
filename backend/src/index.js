import express from "express";
import cors from "cors";
import propertiesRouter from "./routes/properties.js";
import loansRouter from "./routes/loans.js";
import maintenanceRouter from "./routes/maintenance.js";
import legalRouter from "./routes/legal.js";
import expensesRouter from "./routes/expenses.js";
import salesRouter from "./routes/sales.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/properties", propertiesRouter);
app.use("/api/loans", loansRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/legal", legalRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/sales", salesRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
