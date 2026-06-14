import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { properties as api, loans as loansApi, maintenance as maintApi, legal as legalApi, expenses as expApi, sales as salesApi, rentals as rentalsApi } from "../api";

function loadValuations(propertyId) {
  try {
    const store = JSON.parse(localStorage.getItem("propman_data") || "{}");
    return (store.valuations || []).filter(v => v.property_id === Number(propertyId)).sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch { return []; }
}

function saveValuation(v) {
  const store = JSON.parse(localStorage.getItem("propman_data") || "{}");
  if (!store.valuations) store.valuations = [];
  store.valuations.push({ id: Date.now(), ...v, created_at: new Date().toISOString().replace("T", " ").slice(0, 19) });
  localStorage.setItem("propman_data", JSON.stringify(store));
}

function loadNotes(propertyId) {
  try {
    const store = JSON.parse(localStorage.getItem("propman_data") || "{}");
    return (store.notes || []).filter(n => n.property_id === Number(propertyId)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch { return []; }
}

function saveNote(n) {
  const store = JSON.parse(localStorage.getItem("propman_data") || "{}");
  if (!store.notes) store.notes = [];
  store.notes.push({ id: Date.now(), ...n, created_at: new Date().toISOString().replace("T", " ").slice(0, 19) });
  localStorage.setItem("propman_data", JSON.stringify(store));
}

function generateDoc(title, property) {
  const text = `${title}\n\nFecha: ${new Date().toLocaleDateString()}\n\nEntre las partes:\n\nVendedor: [Nombre del Vendedor]\nComprador: [Nombre del Comprador]\n\nPropiedad: ${property.name || "[Nombre de la Propiedad]"}\nDirección: ${property.address || "[Dirección]"}\nÁrea: ${property.area_sqm || "[---]"} m²\n\nDetalles:\n${property.description || "[Sin descripción]"}\n\nFirma: ________________________`;
  navigator.clipboard.writeText(text).then(() => alert("Template copiado al portapapeles")).catch(() => alert("No se pudo copiar"));
}

const STATUS_MAP = { active: "Activo", for_sale: "En Venta", rented: "Alquilado", construction: "En Construcción", abandoned: "Abandonado" };
const LEGAL_MAP = { ok: "OK", in_process: "En Proceso", pending: "Pendiente", observed: "Observado" };
const LOAN_STATUS = { active: "Activo", paid: "Saldado", refinanced: "Refinanciado", defaulted: "En Mora" };

const TABS = ["Detalle", "Préstamos", "Mantenimiento", "Documentos", "Gastos", "Ventas", "Alquileres"];

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loans, setLoans] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [docs, setDocs] = useState([]);
  const [expensesList, setExpenses] = useState([]);
  const [salesList, setSales] = useState([]);
  const [rentalsList, setRentals] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [valuations, setValuations] = useState([]);
  const [showValuationForm, setShowValuationForm] = useState(false);
  const [valForm, setValForm] = useState({ value: "", date: new Date().toISOString().split("T")[0], notes: "" });
  const [collabNotes, setCollabNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
    setValuations(loadValuations(id));
    setCollabNotes(loadNotes(id));
    Promise.all([
      api.get(id),
      loansApi.list(id),
      maintApi.list({ property_id: id }),
      legalApi.list({ property_id: id }),
      expApi.list({ property_id: id }),
      salesApi.list({ property_id: id }),
      rentalsApi.list({ property_id: id }),
    ]).then(([p, l, t, d, e, s, r]) => {
      setProperty(p); setLoans(l); setTasks(t); setDocs(d); setExpenses(e); setSales(s); setRentals(r);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Cargando...</div>;
  if (!property) return <div className="p-8 text-gray-500 dark:text-gray-400">Propiedad no encontrada</div>;

  const mapUrl = property.latitude && property.longitude
    ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=15/${property.latitude}/${property.longitude}`
    : null;

  const totalExpenses = expensesList.reduce((s, e) => s + (e.paid ? e.amount : 0), 0);
  const pendingExpenses = expensesList.filter((e) => !e.paid);
  const activeLoans = loans.filter((l) => l.status === "active");
  const totalDebt = activeLoans.reduce((s, l) => s + (l.remaining_balance || 0), 0);
  const overdueTasks = tasks.filter((t) => t.status === "overdue" || (t.next_due_date && t.next_due_date < new Date().toISOString().split("T")[0] && t.status !== "done"));
  const expiringDocs = docs.filter((d) => d.status === "expiring_soon" || d.status === "expired");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/properties" className="hover:text-blue-600 dark:text-blue-400">Propiedades</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">{property.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Valor Compra</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">${Number(property.purchase_price).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deuda Activa</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">${totalDebt.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gastos Pagados</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Alertas</p>
          <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{overdueTasks.length + expiringDocs.length + pendingExpenses.length}</p>
        </div>
      </div>

      {(overdueTasks.length > 0 || expiringDocs.length > 0 || pendingExpenses.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-200 dark:border-orange-900/50 p-4 mb-6">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <span className="text-sm font-medium">Atención requerida</span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {pendingExpenses.length > 0 && <span className="text-gray-700 dark:text-gray-300"><strong>{pendingExpenses.length}</strong> gastos impagos</span>}
            {overdueTasks.length > 0 && <span className="text-gray-700 dark:text-gray-300"><strong>{overdueTasks.length}</strong> mantenimientos vencidos</span>}
            {expiringDocs.length > 0 && <span className="text-gray-700 dark:text-gray-300"><strong>{expiringDocs.length}</strong> documentos por vencer</span>}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${tab === i ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>{t}</button>
          ))}
        </div>

        <div className="p-6">
          {tab === 0 && (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{property.name}</h1>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${property.general_status === "active" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" : property.general_status === "for_sale" ? "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-blue-700" : property.general_status === "rented" ? "bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 text-purple-700" : property.general_status === "construction" ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700" : "bg-gray-100 text-gray-600 dark:text-gray-400"}`}>{STATUS_MAP[property.general_status]}</span>
                </div>
                <Link to={`/properties/${id}/edit`} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg">Editar</Link>
              </div>

              {((property.photos && property.photos.length > 0) || property.photo) && (
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(property.photos && property.photos.length > 0 ? property.photos : [property.photo]).filter(Boolean).map((photo, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={photo} alt={property.name} className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(photo, "_blank")} />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {property.description && <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400">Descripción:</span><p className="text-gray-900 dark:text-gray-100 mt-1">{property.description}</p></div>}
                {property.address && <div><span className="text-gray-500 dark:text-gray-400">Dirección:</span><p className="text-gray-900 dark:text-gray-100">{property.address}</p></div>}
                {property.area_sqm && <div><span className="text-gray-500 dark:text-gray-400">Área:</span><p className="text-gray-900 dark:text-gray-100">{property.area_sqm} m²</p></div>}
                <div><span className="text-gray-500 dark:text-gray-400">Tipo:</span><p className="text-gray-900 dark:text-gray-100 capitalize">{property.type === "urban" ? "Urbano" : "Rural"}</p></div>
                {property.purchase_date && <div><span className="text-gray-500 dark:text-gray-400">Fecha Compra:</span><p className="text-gray-900 dark:text-gray-100">{property.purchase_date}</p></div>}
                <div><span className="text-gray-500 dark:text-gray-400">Legal:</span><p className={`font-medium ${property.legal_status === "ok" ? "text-green-600 dark:text-green-400" : property.legal_status === "in_process" ? "text-yellow-600" : property.legal_status === "observed" ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}>{LEGAL_MAP[property.legal_status]}</p></div>
              </div>
              {mapUrl && (
                <div className="mt-4">
                  <div className="h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-2">
                    <MapContainer center={[property.latitude, property.longitude]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[property.latitude, property.longitude]}>
                        <Popup>{property.name}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">Abrir en OpenStreetMap</a>
                </div>
              )}
              {property.notes && <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-500 dark:text-gray-400">Notas:</span><p className="text-sm text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{property.notes}</p></div>}

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Historial de Tasaciones</h3>
                  <button onClick={() => setShowValuationForm(!showValuationForm)}
                    className="text-xs bg-blue-600 dark:bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600">
                    {showValuationForm ? "Cancelar" : "+ Agregar"}
                  </button>
                </div>

                {showValuationForm && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg flex gap-3 items-end">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Valor ($)</label>
                      <input type="number" value={valForm.value} onChange={e => setValForm({ ...valForm, value: e.target.value })}
                        className="w-32 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
                      <input type="date" value={valForm.date} onChange={e => setValForm({ ...valForm, date: e.target.value })}
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                    </div>
                    <button onClick={() => {
                      if (!valForm.value) return;
                      saveValuation({ property_id: Number(id), value: Number(valForm.value), date: valForm.date, notes: valForm.notes });
                      setValuations(loadValuations(id));
                      setValForm({ value: "", date: new Date().toISOString().split("T")[0], notes: "" });
                    }} className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">Guardar</button>
                  </div>
                )}

                {valuations.length > 0 ? (
                  <div>
                    <div className="flex items-end gap-1 h-20 mb-3">
                      {(() => {
                        const max = Math.max(...valuations.map(v => v.value));
                        return valuations.slice(0).reverse().map((v, i) => (
                          <div key={v.id} className="flex-1 flex flex-col items-center justify-end" title={`$${v.value.toLocaleString()} (${v.date})`}>
                            <div className="w-full bg-blue-400 dark:bg-blue-500 rounded-t" style={{ height: `${(v.value / max) * 100}%`, minHeight: "4px" }}></div>
                          </div>
                        ));
                      })()}
                    </div>
                    {valuations.map(v => (
                      <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{v.date}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">${v.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sin tasaciones registradas</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Notas Colaborativas</h3>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Agregar nota..."
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    onKeyDown={e => { if (e.key === "Enter" && noteText.trim()) { saveNote({ property_id: Number(id), text: noteText.trim() }); setCollabNotes(loadNotes(id)); setNoteText(""); } }} />
                  <button onClick={() => { if (noteText.trim()) { saveNote({ property_id: Number(id), text: noteText.trim() }); setCollabNotes(loadNotes(id)); setNoteText(""); } }}
                    className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">Enviar</button>
                </div>
                {collabNotes.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {collabNotes.map(n => (
                      <div key={n.id} className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg text-sm">
                        <p className="text-gray-900 dark:text-gray-100">{n.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sin notas aún</p>
                )}
              </div>
            </div>
          )}

          {tab === 1 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Préstamos</h2>
                <Link to={`/properties/${id}/loans/new`} className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">+ Nuevo</Link>
              </div>
              {loans.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin préstamos</p> : (
                <div className="space-y-3">
                  {loans.map((l) => (
                    <div key={l.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div><p className="font-medium text-gray-900 dark:text-gray-100">{l.lender}</p><p className="text-sm text-gray-500 dark:text-gray-400">${Number(l.total_amount).toLocaleString()}</p></div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === "active" ? "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-blue-700" : l.status === "paid" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" : l.status === "refinanced" ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700" : "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700"}`}>{LOAN_STATUS[l.status]}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {l.interest_rate > 0 && <span>{l.interest_rate}%</span>}
                        {l.term_months && <span>{l.term_months} meses</span>}
                        {l.remaining_balance != null && <span>Saldo: ${Number(l.remaining_balance).toLocaleString()}</span>}
                      </div>
                      <div className="flex gap-3 mt-2">
                        <Link to={`/loans/${l.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Ver amortización</Link>
                        <Link to={`/loans/${l.id}/edit`} className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800">Editar</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Mantenimiento</h2>
                <Link to={`/properties/${id}/maintenance/new`} className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">+ Nueva Tarea</Link>
              </div>
              {tasks.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin tareas de mantenimiento</p> : (
                <div className="space-y-3">
                  {tasks.map((t) => (
                    <div key={t.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div><p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{t.type}</p>{t.description && <p className="text-sm text-gray-500 dark:text-gray-400">{t.description}</p>}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "done" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" : t.status === "overdue" ? "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700" : "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700"}`}>{t.status === "done" ? "Completado" : t.status === "overdue" ? "Vencido" : "Pendiente"}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {t.next_due_date && <span>Próximo: {t.next_due_date}</span>}
                        {t.frequency_days && <span>Cada {t.frequency_days} días</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Documentos Legales</h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowTemplate(true)} className="text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">{`<>`} Template</button>
                  <Link to={`/properties/${id}/legal/new`} className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">+ Nuevo</Link>
                </div>
              </div>
              {docs.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin documentos</p> : (
                <div className="space-y-3">
                  {docs.map((d) => (
                    <div key={d.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div><p className="font-medium text-gray-900 dark:text-gray-100">{d.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{d.document_type.replace(/_/g, " ")}</p></div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "valid" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" : d.status === "expiring_soon" ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700" : d.status === "expired" ? "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700" : "bg-gray-100 text-gray-600 dark:text-gray-400"}`}>{d.status === "valid" ? "Vigente" : d.status === "expiring_soon" ? "Por vencer" : d.status === "expired" ? "Vencido" : "Pendiente"}</span>
                      </div>
                      {d.expiry_date && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vence: {d.expiry_date}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 4 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gastos</h2>
                <Link to={`/properties/${id}/expenses/new`} className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">+ Nuevo</Link>
              </div>

              {expensesList.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Resumen por categoría</p>
                  <div className="space-y-2">
                    {Object.entries(
                      expensesList.reduce((acc, e) => {
                        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
                        return acc;
                      }, {})
                    ).map(([cat, total]) => {
                      const maxTotal = Math.max(...Object.values(
                        expensesList.reduce((acc, e) => {
                          acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
                          return acc;
                        }, {})
                      ));
                      const pct = (total / maxTotal) * 100;
                      const colors = { tax: "bg-red-400", insurance: "bg-blue-400", service: "bg-green-400", maintenance: "bg-yellow-400", other: "bg-gray-400" };
                      return (
                        <div key={cat} className="flex items-center gap-3 text-sm">
                          <span className="w-24 capitalize text-gray-600 dark:text-gray-400">{cat === "tax" ? "Impuestos" : cat === "insurance" ? "Seguros" : cat === "service" ? "Servicios" : cat === "maintenance" ? "Mantenimiento" : "Otros"}</span>
                          <div className="flex-1 h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[cat] || "bg-gray-400"} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="w-24 text-right font-medium text-gray-900 dark:text-gray-100">${total.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {expensesList.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin gastos registrados</p> : (
                <div className="space-y-3">
                  {expensesList.map((e) => (
                    <div key={e.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div><p className="font-medium text-gray-900 dark:text-gray-100">{e.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{e.category} {e.frequency !== "one_time" && `· ${e.frequency}`}</p></div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-gray-100">${Number(e.amount).toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${e.paid ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" : "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700"}`}>{e.paid ? "Pagado" : "Impago"}</span>
                        </div>
                      </div>
                      {e.due_date && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vence: {e.due_date}</p>}
                    </div>
                  ))}
            </div>
          )}
          {tab === 6 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Alquileres</h2>
                <Link to={`/properties/${id}/rentals/new`} className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">+ Nuevo Alquiler</Link>
              </div>
              {rentalsList.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin alquileres registrados</p> : (
                <div className="space-y-3">
                  {rentalsList.map(r => (
                    <div key={r.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{r.tenant_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">${Number(r.monthly_rent).toLocaleString()}/mes</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "active" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" : "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700"}`}>{r.status === "active" ? "Activo" : "Finalizado"}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {r.start_date && <span>Inicio: {r.start_date}</span>}
                        {r.end_date && <span>Fin: {r.end_date}</span>}
                        {r.deposit > 0 && <span>Depósito: ${Number(r.deposit).toLocaleString()}</span>}
                      </div>
                      <Link to={`/rentals/${r.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 inline-block">Ver pagos</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
          )}

          {tab === 5 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Ventas</h2>
                <Link to={`/properties/${id}/sales/new`} className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">+ Nueva Venta</Link>
              </div>
              {salesList.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin ventas asociadas</p> : (
                <div className="space-y-3">
                  {salesList.map((s) => (
                    <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{s.buyer_name || "Sin comprador"}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{s.sale_price ? `$${Number(s.sale_price).toLocaleString()}` : "Sin precio"}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "closed" || s.status === "titled" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" : s.status === "interested" || s.status === "visited" ? "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-blue-700" : s.status === "offered" || s.status === "reserved" ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700" : "bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 text-purple-700"}`}>{s.status}</span>
                      </div>
                      <Link to={`/properties/${id}/sales/${s.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 inline-block">Ver detalle</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowTemplate(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Templates de Documentos</h2>
              <button onClick={() => setShowTemplate(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
            </div>
            <div className="space-y-3">
              {[
                { name: "Carta de Intención de Compra", doc: () => generateDoc("CARTA DE INTENCIÓN DE COMPRA", property) },
                { name: "Contrato de Reserva", doc: () => generateDoc("CONTRATO DE RESERVA", property) },
                { name: "Recibo de Señal", doc: () => generateDoc("RECIBO DE SEÑAL", property) },
              ].map(t => (
                <div key={t.name} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{t.name}</p>
                  <button onClick={() => { t.doc(); setShowTemplate(false); }} className="text-sm bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600">Generar</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


