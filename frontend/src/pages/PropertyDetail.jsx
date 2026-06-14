import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { properties as api, loans as loansApi } from "../api";

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

const LOAN_STATUS = {
  active: "Activo",
  paid: "Saldado",
  refinanced: "Refinanciado",
  defaulted: "En Mora",
};

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(id),
      loansApi.list(id),
    ]).then(([p, l]) => {
      setProperty(p);
      setLoans(l);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500">Cargando...</div>;
  if (!property) return <div className="p-8 text-gray-500">Propiedad no encontrada</div>;

  const mapUrl = property.latitude && property.longitude
    ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=15/${property.latitude}/${property.longitude}`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/properties" className="hover:text-blue-600">Propiedades</Link>
        <span>/</span>
        <span className="text-gray-900">{property.name}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
              property.general_status === "active" ? "bg-green-100 text-green-700" :
              property.general_status === "for_sale" ? "bg-blue-100 text-blue-700" :
              property.general_status === "rented" ? "bg-purple-100 text-purple-700" :
              property.general_status === "construction" ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {STATUS_MAP[property.general_status]}
            </span>
          </div>
          <Link to={`/properties/${id}/edit`}
            className="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg">
            Editar
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {property.description && (
            <div className="md:col-span-2">
              <span className="text-gray-500">Descripción:</span>
              <p className="text-gray-900 mt-1">{property.description}</p>
            </div>
          )}
          {property.address && (
            <div>
              <span className="text-gray-500">Dirección:</span>
              <p className="text-gray-900">{property.address}</p>
            </div>
          )}
          {property.area_sqm && (
            <div>
              <span className="text-gray-500">Área:</span>
              <p className="text-gray-900">{property.area_sqm} m²</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Tipo:</span>
            <p className="text-gray-900 capitalize">{property.type === "urban" ? "Urbano" : "Rural"}</p>
          </div>
          {property.purchase_price > 0 && (
            <div>
              <span className="text-gray-500">Precio de Compra:</span>
              <p className="text-gray-900 font-medium">${property.purchase_price.toLocaleString()}</p>
            </div>
          )}
          {property.purchase_date && (
            <div>
              <span className="text-gray-500">Fecha de Compra:</span>
              <p className="text-gray-900">{property.purchase_date}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Estado Legal:</span>
            <p className={`font-medium ${
              property.legal_status === "ok" ? "text-green-600" :
              property.legal_status === "in_process" ? "text-yellow-600" :
              property.legal_status === "observed" ? "text-red-600" : "text-gray-900"
            }`}>{LEGAL_MAP[property.legal_status]}</p>
          </div>
        </div>

        {mapUrl && (
          <div className="mt-4">
            <a href={mapUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline">
              Ver en OpenStreetMap
            </a>
          </div>
        )}

        {property.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Notas:</span>
            <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{property.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Préstamos</h2>
          <Link to={`/properties/${id}/loans/new`}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">
            + Nuevo Préstamo
          </Link>
        </div>

        {loans.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Sin préstamos asociados</p>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{loan.lender}</p>
                    <p className="text-sm text-gray-500">${loan.total_amount.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    loan.status === "active" ? "bg-blue-100 text-blue-700" :
                    loan.status === "paid" ? "bg-green-100 text-green-700" :
                    loan.status === "refinanced" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {LOAN_STATUS[loan.status]}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  {loan.interest_rate > 0 && <span>{loan.interest_rate}% interés</span>}
                  {loan.term_months && <span>{loan.term_months} meses</span>}
                  {loan.remaining_balance != null && (
                    <span>Saldo: ${loan.remaining_balance.toLocaleString()}</span>
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <Link to={`/loans/${loan.id}/edit`}
                    className="text-xs text-blue-600 hover:text-blue-800">Editar</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
