import db from "../database.js";

export function listLoans(req, res) {
  const { property_id } = req.query;
  let loans;
  if (property_id) {
    loans = db.prepare("SELECT * FROM loans WHERE property_id = ? ORDER BY created_at DESC").all(property_id);
  } else {
    loans = db.prepare("SELECT * FROM loans ORDER BY created_at DESC").all();
  }
  res.json(loans);
}

export function getLoan(req, res) {
  const { id } = req.params;
  const loan = db.prepare("SELECT * FROM loans WHERE id = ?").get(id);
  if (!loan) return res.status(404).json({ error: "Loan not found" });
  res.json(loan);
}

export function createLoan(req, res) {
  const {
    property_id, lender, total_amount, interest_rate,
    term_months, start_date, payment_type, remaining_balance, notes,
  } = req.body;

  if (!property_id || !lender || total_amount === undefined) {
    return res.status(400).json({ error: "property_id, lender, and total_amount are required" });
  }

  const property = db.prepare("SELECT id FROM properties WHERE id = ?").get(property_id);
  if (!property) return res.status(404).json({ error: "Property not found" });

  const result = db.prepare(`
    INSERT INTO loans (property_id, lender, total_amount, interest_rate, term_months, start_date, payment_type, remaining_balance, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    property_id, lender, total_amount, interest_rate || 0,
    term_months || null, start_date || null, payment_type || "french",
    remaining_balance ?? total_amount, notes || null,
  );

  const loan = db.prepare("SELECT * FROM loans WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(loan);
}

export function updateLoan(req, res) {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM loans WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Loan not found" });

  const fields = ["lender", "total_amount", "interest_rate", "term_months", "start_date", "payment_type", "status", "remaining_balance", "notes"];
  const updates = fields.filter((f) => req.body[f] !== undefined);
  if (!updates.length) return res.status(400).json({ error: "No fields to update" });

  const setClause = updates.map((f) => `${f} = ?`).join(", ");
  const values = updates.map((f) => req.body[f]);

  db.prepare(`UPDATE loans SET ${setClause}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);

  const loan = db.prepare("SELECT * FROM loans WHERE id = ?").get(id);
  res.json(loan);
}

export function deleteLoan(req, res) {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM loans WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Loan not found" });

  db.prepare("DELETE FROM loans WHERE id = ?").run(id);
  res.status(204).end();
}
