import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "..", "propman.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    area_sqm REAL,
    type TEXT DEFAULT 'urban' CHECK(type IN ('urban','rural')),
    purchase_price REAL DEFAULT 0,
    purchase_date TEXT,
    legal_status TEXT DEFAULT 'pending' CHECK(legal_status IN ('ok','in_process','pending','observed')),
    general_status TEXT DEFAULT 'active' CHECK(general_status IN ('active','for_sale','rented','construction','abandoned')),
    photo TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    lender TEXT NOT NULL,
    total_amount REAL NOT NULL,
    interest_rate REAL DEFAULT 0,
    term_months INTEGER,
    start_date TEXT,
    payment_type TEXT DEFAULT 'french' CHECK(payment_type IN ('french','german','american')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active','paid','refinanced','defaulted')),
    remaining_balance REAL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS loan_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    amount REAL NOT NULL,
    paid INTEGER DEFAULT 0,
    paid_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('painting','pruning','fencing','cleaning','repair','other')),
    description TEXT,
    frequency_days INTEGER,
    last_done_date TEXT,
    next_due_date TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','done','overdue')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS legal_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    document_type TEXT NOT NULL CHECK(document_type IN ('deed','survey','tax_certificate','free_debt','title','other')),
    name TEXT NOT NULL,
    issue_date TEXT,
    expiry_date TEXT,
    status TEXT DEFAULT 'valid' CHECK(status IN ('valid','expiring_soon','expired','pending')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('tax','service','insurance','maintenance','commission','other')),
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    frequency TEXT DEFAULT 'one_time' CHECK(frequency IN ('monthly','quarterly','yearly','one_time')),
    due_date TEXT,
    paid INTEGER DEFAULT 0,
    paid_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    buyer_name TEXT,
    buyer_contact TEXT,
    sale_price REAL,
    status TEXT DEFAULT 'interested' CHECK(status IN ('interested','visited','offered','reserved','signed','titled','closed')),
    commission_amount REAL DEFAULT 0,
    commission_percent REAL DEFAULT 0,
    other_costs REAL DEFAULT 0,
    net_profit REAL,
    expected_close_date TEXT,
    closed_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sale_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT,
    event_date TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
  );
`);

export default db;
