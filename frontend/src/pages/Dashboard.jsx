import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { properties as api, loans as loansApi, maintenance as maintApi, legal as legalApi, expenses as expApi, sales as salesApi, rentals as rentalsApi } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      api.list(), loansApi.list(), maintApi.list(),
      legalApi.list(), expApi.list(), salesApi.list(), rentalsApi.list(),
    ]).then(([props, loans, maint, docs, exp, sales, rentals]) => {
      const now = new Date().toISOString().split("T")[0];
      const totalValue = props.reduce((s, p) => s + Number(p.purchase_price || 0), 0);
      const activeDebt = loans.filter(l => l.status === "active").reduce((s, l) => s + Number(l.remaining_balance || 0), 0);
      const pendingExp = exp.filter(e => !e.paid);
      const overdueMaint = maint.filter(t => t.status !== "done" && t.next_due_date && t.next_due_date <= now);
      const expiringDocs = docs.filter(d => d.status === "expiring_soon" || d.status === "expired");
      const activeSales = sales.filter(s => s.status !== "closed" && s.status !== "titled");

      const activeRentals = rentals.filter(r => r.status === "active");
      const rentalIncome = activeRentals.reduce((s, r) => s + Number(r.monthly_rent), 0);

      const upcomingExpenses = [...exp]
        .filter(e => !e.paid && e.due_date)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5);

      const upcomingMaint = [...maint]
        .filter(t => t.status !== "done" && t.next_due_date)
        .sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date))
        .slice(0, 5);

      setData({
        props, loans, maint, docs, exp, sales, rentals,
        totalValue, activeDebt, pendingExp, overdueMaint, expiringDocs, activeSales, activeRentals, rentalIncome,
        upcomingExpenses, upcomingMaint, stats: {
          totalProperties: props.length,
          activeProperties: props.filter(p => p.general_status === "active").length,
          forSale: props.filter(p => p.general_status === "for_sale").length,
          urbanCount: props.filter(p => p.type === "urban").length,
          ruralCount: props.filter(p => p.type === "rural").length,
          totalLoans: loans.length,
          totalMaint: maint.length,
          totalDocs: docs.length,
          totalExpenses: exp.length,
          totalSales: sales.length,
          totalRentals: rentals.length,
          activeRentals: activeRentals.length,
          rentalIncome,
        }
      });
    });
  }, []);

  if (!data) return <div className="p-8 text-gray-500 dark:text-gray-400">Cargando...</div>;

  const KPI = ({ label, value, color, sub }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || "text-gray-900 dark:text-gray-100"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Resumen general de tu portfolio</p>
        </div>
        <Link to="/properties/new" className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">+ Nueva Propiedad</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPI label="Propiedades" value={data.stats.totalProperties} sub={`${data.stats.activeProperties} activas · ${data.stats.forSale} en venta`} />
        <KPI label="Valor Total" value={`$${data.totalValue.toLocaleString()}`} color="text-green-600 dark:text-green-400" />
        <KPI label="Deuda Activa" value={`$${data.activeDebt.toLocaleString()}`} color="text-red-600 dark:text-red-400" />
        <KPI label="Alertas" value={data.pendingExp.length + data.overdueMaint.length + data.expiringDocs.length} color="text-orange-600 dark:text-orange-400" sub={`${data.pendingExp.length} gastos · ${data.overdueMaint.length} mantenimientos · ${data.expiringDocs.length} documentos`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPI label="Urbanas / Rurales" value={`${data.stats.urbanCount} / ${data.stats.ruralCount}`} />
        <KPI label="Alquileres" value={data.stats.activeRentals} sub={`${data.stats.totalRentals} totales · $${data.rentalIncome.toLocaleString()}/mes`} />
        <KPI label="Ventas Activas" value={data.activeSales.length} />
        <KPI label="Préstamos" value={data.stats.totalLoans} sub={`${data.loans.filter(l => l.status === "active").length} activos`} />
        <KPI label="Gastos Impagos" value={data.pendingExp.length} sub={`$${data.pendingExp.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Próximos Gastos</h2>
          {data.upcomingExpenses.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin gastos pendientes</p>
          ) : (
            <div className="space-y-3">
              {data.upcomingExpenses.map(e => (
                <Link key={e.id} to={`/properties/${e.property_id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{e.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Vence {e.due_date}</p>
                  </div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">${Number(e.amount).toLocaleString()}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Mantenimiento Próximo</h2>
          {data.upcomingMaint.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin mantenimientos pendientes</p>
          ) : (
            <div className="space-y-3">
              {data.upcomingMaint.map(t => (
                <Link key={t.id} to={`/properties/${t.property_id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{t.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.description || "Sin descripción"} · Vence {t.next_due_date}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.next_due_date <= new Date().toISOString().split("T")[0] ? "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700" : "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700"}`}>{t.next_due_date <= new Date().toISOString().split("T")[0] ? "Vencido" : "Pendiente"}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Documentos por Vencer</h2>
          {data.expiringDocs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin documentos por vencer</p>
          ) : (
            <div className="space-y-3">
              {data.expiringDocs.map(d => (
                <Link key={d.id} to={`/properties/${d.property_id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{d.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{d.expiry_date ? `Vence ${d.expiry_date}` : "Sin vencimiento"}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "expired" ? "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700" : "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700"}`}>{d.status === "expired" ? "Vencido" : "Por vencer"}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Ventas Activas</h2>
          {data.activeSales.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin ventas activas</p>
          ) : (
            <div className="space-y-3">
              {data.activeSales.map(s => (
                <Link key={s.id} to={`/properties/${s.property_id}/sales/${s.id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.buyer_name || "Sin comprador"}</p>
                    {s.sale_price && <p className="text-xs text-gray-500 dark:text-gray-400">${Number(s.sale_price).toLocaleString()}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "offered" || s.status === "reserved" ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700" : s.status === "interested" || s.status === "visited" ? "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-blue-700" : "bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 text-purple-700"}`}>{s.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
