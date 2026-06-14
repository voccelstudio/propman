const STORE_KEY = "propman_data";
const SEEDED_KEY = "propman_seeded";

const data = {
  idCounter: 1,
  properties: [],
  loans: [],
  maintenance_tasks: [],
  legal_documents: [],
  expenses: [],
  sales: [],
  sale_events: [],
  valuations: [],
  notes: [],
};

function id() { return data.idCounter++; }
function now() { return "2026-06-14 12:00:00"; }
function days(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0]; }

export function seed() {
  if (localStorage.getItem(SEEDED_KEY)) return;
  localStorage.removeItem(STORE_KEY);

  const p1 = { id: id(), name: "Terreno Norte", description: "Terreno urbano en zona norte, cerca de escuela y hospital. Con todos los servicios.", address: "Av. Colón 2450, Córdoba", latitude: -31.3969, longitude: -64.2614, area_sqm: 500, type: "urban", purchase_price: 80000, purchase_date: "2025-03-15", legal_status: "ok", general_status: "active", photo: "", notes: "Excelente ubicación. Posibilidad de construir hasta 3 pisos.", created_at: now(), updated_at: now() };
  const p2 = { id: id(), name: "Campo Los Alamos", description: "Campo de 5 hectáreas con monte natural y arroyo. Ideal para emprendimiento rural.", address: "Ruta 9 Sur, Km 756, Villa María", latitude: -32.4079, longitude: -63.2431, area_sqm: 5000, type: "rural", purchase_price: 150000, purchase_date: "2024-11-01", legal_status: "in_process", general_status: "active", photo: "", notes: "Documentación en trámite. Escritura matriz en proceso de subdivisión.", created_at: now(), updated_at: now() };
  const p3 = { id: id(), name: "Lote Centro", description: "Lote céntrico ideal para edificio de departamentos o local comercial.", address: "San Martín 350, Córdoba", latitude: -31.4181, longitude: -64.1848, area_sqm: 200, type: "urban", purchase_price: 120000, purchase_date: "2026-01-20", legal_status: "pending", general_status: "for_sale", photo: "", notes: "En venta. Precio negociable.", created_at: now(), updated_at: now() };

  data.properties.push(p1, p2, p3);

  const l1 = { id: id(), property_id: p1.id, lender: "Banco Nación", total_amount: 50000, interest_rate: 8.5, term_months: 120, start_date: "2025-04-01", payment_type: "french", status: "active", remaining_balance: 46000, notes: "Hipoteca sobre el Terreno Norte.", created_at: now(), updated_at: now() };
  const l2 = { id: id(), property_id: p2.id, lender: "Banco Provincia", total_amount: 100000, interest_rate: 12, term_months: 180, start_date: "2024-12-01", payment_type: "french", status: "active", remaining_balance: 97000, notes: "Préstamo para compra del campo.", created_at: now(), updated_at: now() };

  data.loans.push(l1, l2);

  const m1 = { id: id(), property_id: p1.id, type: "pruning", description: "Podar árboles del frente y jardín", frequency_days: 90, last_done_date: "2026-03-10", next_due_date: days(0), status: "pending", notes: "", created_at: now(), updated_at: now() };
  const m2 = { id: id(), property_id: p1.id, type: "painting", description: "Pintar frente y muros perimetrales", frequency_days: 365, last_done_date: "2025-12-01", next_due_date: days(90), status: "pending", notes: "", created_at: now(), updated_at: now() };
  const m3 = { id: id(), property_id: p3.id, type: "cleaning", description: "Limpieza general del terreno", frequency_days: 30, last_done_date: "2026-05-01", next_due_date: days(-10), status: "overdue", notes: "", created_at: now(), updated_at: now() };

  data.maintenance_tasks.push(m1, m2, m3);

  const d1 = { id: id(), property_id: p1.id, document_type: "deed", name: "Escritura de Compraventa", issue_date: "2025-03-15", expiry_date: null, status: "valid", notes: "Escritura N° 12345 ante Escribanía García.", created_at: now(), updated_at: now() };
  const d2 = { id: id(), property_id: p1.id, document_type: "tax_certificate", name: "Certificado de Deuda Municipal", issue_date: "2026-01-10", expiry_date: days(60), status: "valid", notes: "", created_at: now(), updated_at: now() };
  const d3 = { id: id(), property_id: p2.id, document_type: "survey", name: "Plano de Mensura", issue_date: "2024-10-01", expiry_date: days(-30), status: "expired", notes: "Vencido, renovar antes de escriturar.", created_at: now(), updated_at: now() };
  const d4 = { id: id(), property_id: p2.id, document_type: "free_debt", name: "Libre Deuda Municipal", issue_date: "2024-10-15", expiry_date: days(15), status: "expiring_soon", notes: "", created_at: now(), updated_at: now() };

  data.legal_documents.push(d1, d2, d3, d4);

  const e1 = { id: id(), property_id: p1.id, category: "tax", name: "ABL Anual", amount: 5000, frequency: "yearly", due_date: "2026-12-31", paid: 0, paid_date: null, notes: "", created_at: now(), updated_at: now() };
  const e2 = { id: id(), property_id: p1.id, category: "insurance", name: "Seguro Todo Riesgo", amount: 3000, frequency: "yearly", due_date: "2026-04-01", paid: 1, paid_date: "2026-03-28", notes: "Póliza N° 99999", created_at: now(), updated_at: now() };
  const e3 = { id: id(), property_id: p2.id, category: "tax", name: "Impuesto Inmobiliario Rural", amount: 8000, frequency: "yearly", due_date: "2026-06-30", paid: 0, paid_date: null, notes: "", created_at: now(), updated_at: now() };
  const e4 = { id: id(), property_id: p3.id, category: "service", name: "Luz", amount: 1200, frequency: "monthly", due_date: days(5), paid: 0, paid_date: null, notes: "", created_at: now(), updated_at: now() };
  const e5 = { id: id(), property_id: p1.id, category: "service", name: "Agua", amount: 800, frequency: "monthly", due_date: days(2), paid: 0, paid_date: null, notes: "", created_at: now(), updated_at: now() };

  data.expenses.push(e1, e2, e3, e4, e5);

  const s1 = { id: id(), property_id: p3.id, buyer_name: "Juan Pérez", buyer_contact: "juan@email.com / 351-5551234", sale_price: 150000, status: "offered", commission_amount: 6000, commission_percent: 4, other_costs: 3000, net_profit: null, expected_close_date: "2026-08-01", closed_date: null, notes: "Comprador interesado. Pidió 30 días para financiamiento.", created_at: now(), updated_at: now() };

  data.sales.push(s1);

  data.sale_events.push(
    { id: id(), sale_id: s1.id, event_type: "created", description: "Venta iniciada", event_date: "2026-06-01 10:00:00", created_at: now() },
    { id: id(), sale_id: s1.id, event_type: "status_change", description: "Comprador visitó el terreno", event_date: "2026-06-05 14:30:00", created_at: now() },
    { id: id(), sale_id: s1.id, event_type: "status_change", description: "Oferta presentada: $150,000", event_date: "2026-06-10 11:00:00", created_at: now() },
  );

  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  localStorage.setItem(SEEDED_KEY, "1");

  const valuations = [
    { id: id(), property_id: p1.id, value: 75000, date: "2025-01-15", notes: "Tasación inicial", created_at: now() },
    { id: id(), property_id: p1.id, value: 82000, date: "2025-06-20", notes: "Revaluación por mejoras", created_at: now() },
    { id: id(), property_id: p1.id, value: 88000, date: "2026-03-10", notes: "Tasación mercado actual", created_at: now() },
    { id: id(), property_id: p2.id, value: 140000, date: "2024-10-01", notes: "Tasación compra", created_at: now() },
  ];
  data.valuations = valuations;

  const notes = [
    { id: id(), property_id: p1.id, text: "Hablar con el escribano para la subdivisión.", created_at: "2026-06-10 09:30:00" },
    { id: id(), property_id: p1.id, text: "El cerco perimetral necesita reparación.", created_at: "2026-06-12 14:00:00" },
    { id: id(), property_id: p2.id, text: "Contactar al agrimensor para actualizar el plano.", created_at: "2026-06-11 11:00:00" },
  ];
  data.notes = notes;
}
