import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { sales as api } from "../api";

const STATUS_MAP = { interested: "Interesado", visited: "Visitó", offered: "Oferta", reserved: "Reservado", signed: "Firmado", titled: "Escriturado", closed: "Cerrado" };

export default function SaleDetail() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);

  useEffect(() => {
    api.get(id).then(setSale);
  }, [id]);

  if (!sale) return <div className="p-8 text-gray-500 dark:text-gray-400">Cargando...</div>;

  const netProfit = sale.sale_price
    ? sale.sale_price - sale.commission_amount - sale.other_costs
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/properties" className="hover:text-blue-600 dark:text-blue-400">Propiedades</Link>
        <span>/</span>
        <Link to={`/properties/${sale.property_id}`} className="hover:text-blue-600 dark:text-blue-400">Detalle</Link>
        <span>/</span>
        <span>Venta</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sale.buyer_name || "Sin comprador"}</h1>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
              sale.status === "closed" || sale.status === "titled" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" :
              sale.status === "interested" || sale.status === "visited" ? "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-blue-700" :
              sale.status === "offered" || sale.status === "reserved" ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700" :
              "bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 text-purple-700"
            }`}>{STATUS_MAP[sale.status]}</span>
          </div>
          <Link to={`/properties/${sale.property_id}/sales/${sale.id}/edit`} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg">Editar</Link>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {sale.sale_price && <div><span className="text-gray-500 dark:text-gray-400">Precio de Venta:</span><p className="text-gray-900 dark:text-gray-100 font-medium">${Number(sale.sale_price).toLocaleString()}</p></div>}
          {sale.commission_amount > 0 && <div><span className="text-gray-500 dark:text-gray-400">Comisión:</span><p className="text-gray-900 dark:text-gray-100">${Number(sale.commission_amount).toLocaleString()}{sale.commission_percent > 0 && ` (${sale.commission_percent}%)`}</p></div>}
          {sale.other_costs > 0 && <div><span className="text-gray-500 dark:text-gray-400">Otros Costos:</span><p className="text-gray-900 dark:text-gray-100">${Number(sale.other_costs).toLocaleString()}</p></div>}
          {netProfit !== null && (
            <div className="col-span-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Ganancia Neta Estimada:</span>
              <p className={`text-lg font-bold ${netProfit > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                ${netProfit.toLocaleString()}
                {sale.sale_price > 0 && ` (${((netProfit / sale.sale_price) * 100).toFixed(1)}%)`}
              </p>
            </div>
          )}
          {sale.expected_close_date && <div><span className="text-gray-500 dark:text-gray-400">Cierre Estimado:</span><p className="text-gray-900 dark:text-gray-100">{sale.expected_close_date}</p></div>}
          {sale.closed_date && <div><span className="text-gray-500 dark:text-gray-400">Cerrado el:</span><p className="text-gray-900 dark:text-gray-100">{sale.closed_date}</p></div>}
          {sale.buyer_contact && <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400">Contacto:</span><p className="text-gray-900 dark:text-gray-100">{sale.buyer_contact}</p></div>}
          {sale.notes && <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400">Notas:</span><p className="text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{sale.notes}</p></div>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Timeline</h2>
        {sale.events && sale.events.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {sale.events.map((ev, i) => (
                <div key={ev.id || i} className="relative pl-10">
                  <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${i === 0 ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-400"}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{ev.event_type.replace(/_/g, " ")}</p>
                    {ev.description && <p className="text-xs text-gray-500 dark:text-gray-400">{ev.description}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{ev.event_date ? new Date(ev.event_date).toLocaleString() : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin eventos registrados</p>
        )}
      </div>
    </div>
  );
}


