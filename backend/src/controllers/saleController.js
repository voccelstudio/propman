import db from "../database.js";

export function listSales(req, res) {
  const { property_id, status } = req.query;
  let sql = "SELECT * FROM sales WHERE 1=1";
  const params = [];
  if (property_id) { sql += " AND property_id = ?"; params.push(property_id); }
  if (status) { sql += " AND status = ?"; params.push(status); }
  sql += " ORDER BY created_at DESC";
  res.json(db.prepare(sql).all(...params));
}

export function getSale(req, res) {
  const sale = db.prepare("SELECT * FROM sales WHERE id = ?").get(req.params.id);
  if (!sale) return res.status(404).json({ error: "Sale not found" });
  const events = db.prepare("SELECT * FROM sale_events WHERE sale_id = ? ORDER BY event_date ASC").all(req.params.id);
  res.json({ ...sale, events });
}

export function createSale(req, res) {
  const { property_id, buyer_name, buyer_contact, sale_price, status, commission_amount, commission_percent, other_costs, expected_close_date, notes } = req.body;
  if (!property_id) return res.status(400).json({ error: "property_id is required" });
  const result = db.prepare(`
    INSERT INTO sales (property_id, buyer_name, buyer_contact, sale_price, status, commission_amount, commission_percent, other_costs, expected_close_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(property_id, buyer_name || null, buyer_contact || null, sale_price || null, status || "interested", commission_amount || 0, commission_percent || 0, other_costs || 0, expected_close_date || null, notes || null);
  const sale = db.prepare("SELECT * FROM sales WHERE id = ?").get(result.lastInsertRowid);
  db.prepare("INSERT INTO sale_events (sale_id, event_type, description, event_date) VALUES (?, 'created', 'Venta iniciada', datetime('now'))").run(sale.id);
  res.status(201).json(sale);
}

export function updateSale(req, res) {
  const existing = db.prepare("SELECT * FROM sales WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Sale not found" });
  const fields = ["buyer_name", "buyer_contact", "sale_price", "status", "commission_amount", "commission_percent", "other_costs", "net_profit", "expected_close_date", "closed_date", "notes"];
  const updates = fields.filter((f) => req.body[f] !== undefined);
  if (!updates.length) return res.status(400).json({ error: "No fields to update" });
  const setClause = updates.map((f) => `${f} = ?`).join(", ");
  db.prepare(`UPDATE sales SET ${setClause}, updated_at = datetime('now') WHERE id = ?`).run(...updates.map((f) => req.body[f]), req.params.id);
  if (req.body.status && req.body.status !== existing.status) {
    db.prepare("INSERT INTO sale_events (sale_id, event_type, description, event_date) VALUES (?, 'status_change', ?, datetime('now'))").run(req.params.id, `Estado cambiado a: ${req.body.status}`);
  }
  res.json(db.prepare("SELECT * FROM sales WHERE id = ?").get(req.params.id));
}

export function deleteSale(req, res) {
  const existing = db.prepare("SELECT * FROM sales WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Sale not found" });
  db.prepare("DELETE FROM sales WHERE id = ?").run(req.params.id);
  res.status(204).end();
}

export function addSaleEvent(req, res) {
  const { sale_id, event_type, description, event_date } = req.body;
  if (!sale_id || !event_type) return res.status(400).json({ error: "sale_id and event_type are required" });
  const result = db.prepare("INSERT INTO sale_events (sale_id, event_type, description, event_date) VALUES (?, ?, ?, ?)").run(sale_id, event_type, description || null, event_date || new Date().toISOString());
  res.status(201).json(db.prepare("SELECT * FROM sale_events WHERE id = ?").get(result.lastInsertRowid));
}
