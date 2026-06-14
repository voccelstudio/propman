import db from "../database.js";

export function listDocuments(req, res) {
  const { property_id, status } = req.query;
  let sql = "SELECT * FROM legal_documents WHERE 1=1";
  const params = [];
  if (property_id) { sql += " AND property_id = ?"; params.push(property_id); }
  if (status) { sql += " AND status = ?"; params.push(status); }
  sql += " ORDER BY expiry_date ASC";
  res.json(db.prepare(sql).all(...params));
}

export function getDocument(req, res) {
  const doc = db.prepare("SELECT * FROM legal_documents WHERE id = ?").get(req.params.id);
  if (!doc) return res.status(404).json({ error: "Document not found" });
  res.json(doc);
}

export function createDocument(req, res) {
  const { property_id, document_type, name, issue_date, expiry_date, status, notes } = req.body;
  if (!property_id || !document_type || !name) return res.status(400).json({ error: "property_id, document_type, and name are required" });
  const result = db.prepare(`
    INSERT INTO legal_documents (property_id, document_type, name, issue_date, expiry_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(property_id, document_type, name, issue_date || null, expiry_date || null, status || "valid", notes || null);
  res.status(201).json(db.prepare("SELECT * FROM legal_documents WHERE id = ?").get(result.lastInsertRowid));
}

export function updateDocument(req, res) {
  const existing = db.prepare("SELECT * FROM legal_documents WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Document not found" });
  const fields = ["document_type", "name", "issue_date", "expiry_date", "status", "notes"];
  const updates = fields.filter((f) => req.body[f] !== undefined);
  if (!updates.length) return res.status(400).json({ error: "No fields to update" });
  const setClause = updates.map((f) => `${f} = ?`).join(", ");
  db.prepare(`UPDATE legal_documents SET ${setClause}, updated_at = datetime('now') WHERE id = ?`).run(...updates.map((f) => req.body[f]), req.params.id);
  res.json(db.prepare("SELECT * FROM legal_documents WHERE id = ?").get(req.params.id));
}

export function deleteDocument(req, res) {
  const existing = db.prepare("SELECT * FROM legal_documents WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Document not found" });
  db.prepare("DELETE FROM legal_documents WHERE id = ?").run(req.params.id);
  res.status(204).end();
}
