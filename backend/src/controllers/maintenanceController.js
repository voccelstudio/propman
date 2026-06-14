import db from "../database.js";

export function listTasks(req, res) {
  const { property_id, status } = req.query;
  let sql = "SELECT * FROM maintenance_tasks WHERE 1=1";
  const params = [];
  if (property_id) { sql += " AND property_id = ?"; params.push(property_id); }
  if (status) { sql += " AND status = ?"; params.push(status); }
  sql += " ORDER BY next_due_date ASC";
  res.json(db.prepare(sql).all(...params));
}

export function getTask(req, res) {
  const task = db.prepare("SELECT * FROM maintenance_tasks WHERE id = ?").get(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
}

export function createTask(req, res) {
  const { property_id, type, description, frequency_days, last_done_date, next_due_date, notes } = req.body;
  if (!property_id || !type) return res.status(400).json({ error: "property_id and type are required" });
  const result = db.prepare(`
    INSERT INTO maintenance_tasks (property_id, type, description, frequency_days, last_done_date, next_due_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(property_id, type, description || null, frequency_days || null, last_done_date || null, next_due_date || null, notes || null);
  res.status(201).json(db.prepare("SELECT * FROM maintenance_tasks WHERE id = ?").get(result.lastInsertRowid));
}

export function updateTask(req, res) {
  const existing = db.prepare("SELECT * FROM maintenance_tasks WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Task not found" });
  const fields = ["type", "description", "frequency_days", "last_done_date", "next_due_date", "status", "notes"];
  const updates = fields.filter((f) => req.body[f] !== undefined);
  if (!updates.length) return res.status(400).json({ error: "No fields to update" });
  const setClause = updates.map((f) => `${f} = ?`).join(", ");
  db.prepare(`UPDATE maintenance_tasks SET ${setClause}, updated_at = datetime('now') WHERE id = ?`).run(...updates.map((f) => req.body[f]), req.params.id);
  res.json(db.prepare("SELECT * FROM maintenance_tasks WHERE id = ?").get(req.params.id));
}

export function deleteTask(req, res) {
  const existing = db.prepare("SELECT * FROM maintenance_tasks WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Task not found" });
  db.prepare("DELETE FROM maintenance_tasks WHERE id = ?").run(req.params.id);
  res.status(204).end();
}
