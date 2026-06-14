import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { properties as api, loans as loansApi, maintenance as maintApi, legal as legalApi, expenses as expApi, sales as salesApi } from "../api";

const STATUS_MAP = { active: "Activo", for_sale: "En Venta", rented: "Alquilado", construction: "En Construcción", abandoned: "Abandonado" };
const LEGAL_MAP = { ok: "OK", in_process: "En Proceso", pending: "Pendiente", observed: "Observado" };
const LOAN_STATUS = { active: "Activo", paid: "Saldado", refinanced: "Refinanciado", defaulted: "En Mora" };

const TABS = ["Detalle", "Préstamos", "Mantenimiento", "Documentos", "Gastos", "Ventas"];

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loans, setLoans] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [docs, setDocs] = useState([]);
  const [expensesList, setExpenses] = useState([]);
  const [salesList, setSales] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(id),
      loansApi.list(id),
      maintApi.list({ property_id: id }),
      legal.list({ property_id: id }),
      expApi.list({ property_id: id }),
      sales.list({ property_id: id }),
    ]).then(([p, l, t, d, e, s]) => {
      setProperty(p); setLoans(l); setTasks(t); setDocs(d); setExpenses(e); setSales(s);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500">Cargando...</div>;
  if (!property) return <div className="p-8 text-gray-500">Propiedad no encontrada</div>;

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
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/properties" className="hover:text-blue-600">Propiedades</Link>
        <span>/</span>
        <span className="text-gray-900">{property.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Valor Compra</p>
          <p className="text-xl font-bold text-gray-900">${Number(property.purchase_price).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Deuda Activa</p>
          <p className="text-xl font-bold text-red-600">${totalDebt.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Gastos Pagados</p>
          <p className="text-xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Alertas</p>
          <p className="text-xl font-bold text-orange-600">{overdueTasks.length + expiringDocs.length + pendingExpenses.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${tab === i ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>{t}</button>
          ))}
        </div>

        <div className="p-6">
          {tab === 0 && (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${property.general_status === "active" ? "bg-green-100 text-green-700" : property.general_status === "for_sale" ? "bg-blue-100 text-blue-700" : property.general_status === "rented" ? "bg-purple-100 text-purple-700" : property.general_status === "construction" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{STATUS_MAP[property.general_status]}</span>
                </div>
                <Link to={`/properties/${id}/edit`} className="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg">Editar</Link>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {property.description && <div className="col-span-2"><span className="text-gray-500">Descripción:</span><p className="text-gray-900 mt-1">{property.description}</p></div>}
                {property.address && <div><span className="text-gray-500">Dirección:</span><p className="text-gray-900">{property.address}</p></div>}
                {property.area_sqm && <div><span className="text-gray-500">Área:</span><p className="text-gray-900">{property.area_sqm} m²</p></div>}
                <div><span className="text-gray-500">Tipo:</span><p className="text-gray-900 capitalize">{property.type === "urban" ? "Urbano" : "Rural"}</p></div>
                {property.purchase_date && <div><span className="text-gray-500">Fecha Compra:</span><p className="text-gray-900">{property.purchase_date}</p></div>}
                <div><span className="text-gray-500">Legal:</span><p className={`font-medium ${property.legal_status === "ok" ? "text-green-600" : property.legal_status === "in_process" ? "text-yellow-600" : property.legal_status === "observed" ? "text-red-600" : "text-gray-900"}`}>{LEGAL_MAP[property.legal_status]}</p></div>
              </div>
              {mapUrl && (
                <div className="mt-4">
                  <div className="h-48 rounded-lg overflow-hidden border border-gray-200 mb-2">
                    <MapContainer center={[property.latitude, property.longitude]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[property.latitude, property.longitude]}>
                        <Popup>{property.name}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">Abrir en OpenStreetMap</a>
                </div>
              )}
              {property.notes && <div className="mt-4 pt-4 border-t border-gray-100"><span className="text-sm text-gray-500">Notas:</span><p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{property.notes}</p></div>}
            </div>
          )}

          {tab === 1 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Préstamos</h2>
                <Link to={`/properties/${id}/loans/new`} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">+ Nuevo</Link>
              </div>
              {loans.length === 0 ? <p className="text-sm text-gray-500 py-4 text-center">Sin préstamos</p> : (
                <div className="space-y-3">
                  {loans.map((l) => (
                    <div key={l.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div><p className="font-medium text-gray-900">{l.lender}</p><p className="text-sm text-gray-500">${Number(l.total_amount).toLocaleString()}</p></div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === "active" ? "bg-blue-100 text-blue-700" : l.status === "paid" ? "bg-green-100 text-green-700" : l.status === "refinanced" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{LOAN_STATUS[l.status]}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        {l.interest_rate > 0 && <span>{l.interest_rate}%</span>}
                        {l.term_months && <span>{l.term_months} meses</span>}
                        {l.remaining_balance != null && <span>Saldo: ${Number(l.remaining_balance).toLocaleString()}</span>}
                      </div>
                      <Link to={`/loans/${l.id}/edit`} className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block">Editar</Link>
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
                <Link to={`/properties/${id}/maintenance/new`} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">+ Nueva Tarea</Link>
              </div>
              {tasks.length === 0 ? <p className="text-sm text-gray-500 py-4 text-center">Sin tareas de mantenimiento</p> : (
                <div className="space-y-3">
                  {tasks.map((t) => (
                    <div key={t.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div><p className="font-medium text-gray-900 capitalize">{t.type}</p>{t.description && <p className="text-sm text-gray-500">{t.description}</p>}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "done" ? "bg-green-100 text-green-700" : t.status === "overdue" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{t.status === "done" ? "Completado" : t.status === "overdue" ? "Vencido" : "Pendiente"}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500 mt-2">
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
                <Link to={`/properties/${id}/legal/new`} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">+ Nuevo</Link>
              </div>
              {docs.length === 0 ? <p className="text-sm text-gray-500 py-4 text-center">Sin documentos</p> : (
                <div className="space-y-3">
                  {docs.map((d) => (
                    <div key={d.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div><p className="font-medium text-gray-900">{d.name}</p><p className="text-xs text-gray-500 capitalize">{d.document_type.replace(/_/g, " ")}</p></div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "valid" ? "bg-green-100 text-green-700" : d.status === "expiring_soon" ? "bg-yellow-100 text-yellow-700" : d.status === "expired" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{d.status === "valid" ? "Vigente" : d.status === "expiring_soon" ? "Por vencer" : d.status === "expired" ? "Vencido" : "Pendiente"}</span>
                      </div>
                      {d.expiry_date && <p className="text-xs text-gray-500 mt-1">Vence: {d.expiry_date}</p>}
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
                <Link to={`/properties/${id}/expenses/new`} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">+ Nuevo</Link>
              </div>
              {expensesList.length === 0 ? <p className="text-sm text-gray-500 py-4 text-center">Sin gastos registrados</p> : (
                <div className="space-y-3">
                  {expensesList.map((e) => (
                    <div key={e.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div><p className="font-medium text-gray-900">{e.name}</p><p className="text-xs text-gray-500 capitalize">{e.category} {e.frequency !== "one_time" && `· ${e.frequency}`}</p></div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${Number(e.amount).toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${e.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{e.paid ? "Pagado" : "Impago"}</span>
                        </div>
                      </div>
                      {e.due_date && <p className="text-xs text-gray-500 mt-1">Vence: {e.due_date}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 5 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Ventas</h2>
                <Link to={`/properties/${id}/sales/new`} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">+ Nueva Venta</Link>
              </div>
              {salesList.length === 0 ? <p className="text-sm text-gray-500 py-4 text-center">Sin ventas asociadas</p> : (
                <div className="space-y-3">
                  {salesList.map((s) => (
                    <div key={s.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{s.buyer_name || "Sin comprador"}</p>
                          <p className="text-sm text-gray-500">{s.sale_price ? `$${Number(s.sale_price).toLocaleString()}` : "Sin precio"}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "closed" || s.status === "titled" ? "bg-green-100 text-green-700" : s.status === "interested" || s.status === "visited" ? "bg-blue-100 text-blue-700" : s.status === "offered" || s.status === "reserved" ? "bg-yellow-100 text-yellow-700" : "bg-purple-100 text-purple-700"}`}>{s.status}</span>
                      </div>
                      <Link to={`/properties/${id}/sales/${s.id}`} className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block">Ver detalle</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
