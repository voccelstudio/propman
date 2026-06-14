import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { properties as api } from "../api";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MapView() {
  const [props, setProps] = useState([]);

  useEffect(() => {
    api.list().then(setProps);
  }, []);

  const withCoords = props.filter(p => p.latitude && p.longitude);

  if (withCoords.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Mapa Global</h1>
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Sin propiedades con ubicación</p>
          <p className="text-sm">Agregá coordenadas a las propiedades para verlas en el mapa</p>
        </div>
      </div>
    );
  }

  const center = withCoords.length === 1
    ? [withCoords[0].latitude, withCoords[0].longitude]
    : [
        withCoords.reduce((s, p) => s + p.latitude, 0) / withCoords.length,
        withCoords.reduce((s, p) => s + p.longitude, 0) / withCoords.length,
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mapa Global</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{withCoords.length} propiedades con ubicación</p>
      </div>

      <div className="h-[70vh] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer center={center} zoom={8} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {withCoords.map(p => (
            <Marker key={p.id} position={[p.latitude, p.longitude]}>
              <Popup>
                <div className="text-sm">
                  <Link to={`/properties/${p.id}`} className="font-semibold text-blue-600 hover:text-blue-800">{p.name}</Link>
                  {p.area_sqm && <p className="text-gray-500">{p.area_sqm} m²</p>}
                  {p.purchase_price > 0 && <p className="text-gray-700 font-medium">${p.purchase_price.toLocaleString()}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {withCoords.map(p => (
          <Link key={p.id} to={`/properties/${p.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
              {p.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
