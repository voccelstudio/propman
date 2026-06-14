import db from "../database.js";

export function listExpenses(req, res) {
  const { property_id, category, paid } = req.query;
  let sql = "SELECT * FROM expenses WHERE 1=1";
  const params = [];
  if (property_id) { sql += " AND property_id = ?"; params.push(property_id); }
  if (category) { sql += " AND category = ?"; params.push(category); }
  if (paid !== undefined) { sql += " AND paid = ?"; params.push(paid === "true" ? 1 : 0); }
  sql += " ORDER BY due_date DESC";
  res.json(db.prepare(sql).all(...params));
}

export function getExpense(req, res) {
  const exp = db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id);
  if (!exp) return res.status(404).json({ error: "Expense not found" });
  res.json(exp);
}

export function createExpense(req, res) {
  const { property_id, category, name, amount, frequency, due_date, notes } = req.body;
  if (!property_id || !category || !name || amount === undefined) {
    return res.status(400).json({ error: "property_id, category, name, and amount are required" });
  }
  const result = db.prepare(`
    INSERT INTO expenses (property_id, category, name, amount, frequency, due_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(property_id, category, name, amount, frequency || "one_time", due_date || null, notes || null);
  res.status(201).json(db.prepare("SELECT * FROM expenses WHERE id = ?").get(result.lastInsertRowid));
}

export function updateExpense(req, res) {
  const existing = db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Expense not found" });
  const fields = ["category", "name", "amount", "frequency", "due_date", "paid", "paid_date", "notes"];
  const updates = fields.filter((f) => req.body[f] !== undefined);
  if (!updates.length) return res.status(400).json({ error: "No fields to update" });
  const setClause = updates.map((f) => `${f} = ?`).join(", ");
  db.prepare(`UPDATE expenses SET ${setClause}, updated_at = datetime('now') WHERE id = ?`).run(...updates.map((f) => req.body[f]), req.params.id);
  res.json(db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id));
}

export function deleteExpense(req, res) {
  const existing = db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Expense not found" });
  db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
  res.status(204).end();
}
