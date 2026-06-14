import db from "../database.js";

export function listProperties(req, res) {
  const properties = db.prepare("SELECT * FROM properties ORDER BY updated_at DESC").all();
  res.json(properties);
}

export function getProperty(req, res) {
  const { id } = req.params;
  const property = db.prepare("SELECT * FROM properties WHERE id = ?").get(id);
  if (!property) return res.status(404).json({ error: "Property not found" });
  res.json(property);
}

export function createProperty(req, res) {
  const {
    name, description, address, latitude, longitude,
    area_sqm, type, purchase_price, purchase_date,
    legal_status, general_status, notes,
  } = req.body;

  if (!name) return res.status(400).json({ error: "Name is required" });

  const result = db.prepare(`
    INSERT INTO properties (name, description, address, latitude, longitude, area_sqm, type, purchase_price, purchase_date, legal_status, general_status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, description || null, address || null, latitude || null, longitude || null,
    area_sqm || null, type || "urban", purchase_price || 0, purchase_date || null,
    legal_status || "pending", general_status || "active", notes || null,
  );

  const property = db.prepare("SELECT * FROM properties WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(property);
}

export function updateProperty(req, res) {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM properties WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Property not found" });

  const fields = [
    "name", "description", "address", "latitude", "longitude",
    "area_sqm", "type", "purchase_price", "purchase_date",
    "legal_status", "general_status", "notes",
  ];

  const updates = fields.filter((f) => req.body[f] !== undefined);
  if (!updates.length) return res.status(400).json({ error: "No fields to update" });

  const setClause = updates.map((f) => `${f} = ?`).join(", ");
  const values = updates.map((f) => req.body[f]);

  db.prepare(`UPDATE properties SET ${setClause}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);

  const property = db.prepare("SELECT * FROM properties WHERE id = ?").get(id);
  res.json(property);
}

export function deleteProperty(req, res) {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM properties WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Property not found" });

  db.prepare("DELETE FROM properties WHERE id = ?").run(id);
  res.status(204).end();
}
