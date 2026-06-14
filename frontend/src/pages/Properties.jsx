import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { properties as api } from "../api";

const STATUS_MAP = {
  active: "Activo",
  for_sale: "En Venta",
  rented: "Alquilado",
  construction: "En Construcción",
  abandoned: "Abandonado",
};

const LEGAL_MAP = {
  ok: "OK",
  in_process: "En Proceso",
  pending: "Pendiente",
  observed: "Observado",
};

export default function Properties() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.list().then(setList).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta propiedad?")) return;
    await api.delete(id);
    setList((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Propiedades</h1>
        <Link
          to="/properties/new"
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          + Nueva Propiedad
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No hay propiedades registradas</p>
          <p className="text-sm">Crea la primera para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {(p.photo || (p.latitude && p.longitude)) && (
                <div className="h-36 bg-gray-100 overflow-hidden">
                  {p.photo ? (
                    <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src={`https://staticmap.openstreetmap.de/staticmap.php?center=${p.latitude},${p.longitude}&zoom=14&size=400x200&markers=${p.latitude},${p.longitude}`}
                      alt="Mapa" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none" }} />
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.general_status === "active" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" :
                    p.general_status === "for_sale" ? "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-blue-700" :
                    p.general_status === "rented" ? "bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 text-purple-700" :
                    p.general_status === "construction" ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700" :
                    "bg-gray-100 text-gray-600 dark:text-gray-400"
                  }`}>
                    {STATUS_MAP[p.general_status]}
                  </span>
                </div>

                {p.address && <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{p.address}</p>}
                {p.area_sqm && <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{p.area_sqm} m²</p>}
                {p.purchase_price > 0 && (
                  <p className="text-sm text-gray-700 font-medium">
                    ${p.purchase_price.toLocaleString()}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.legal_status === "ok" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" :
                    p.legal_status === "in_process" ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700" :
                    p.legal_status === "observed" ? "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700" :
                    "bg-gray-100 text-gray-600 dark:text-gray-400"
                  }`}>
                    {LEGAL_MAP[p.legal_status]}
                  </span>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Link to={`/properties/${p.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Ver</Link>
                  <Link to={`/properties/${p.id}/edit`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800">Editar</Link>
                  <button onClick={() => handleDelete(p.id)} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 ml-auto">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


