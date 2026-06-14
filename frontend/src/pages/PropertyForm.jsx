import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { properties as api } from "../api";

const INITIAL = {
  name: "", description: "", address: "", latitude: "", longitude: "",
  area_sqm: "", type: "urban", purchase_price: "", purchase_date: "",
  legal_status: "pending", general_status: "active", notes: "",
};

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.get(id).then((p) => {
        setForm({
          name: p.name || "",
          description: p.description || "",
          address: p.address || "",
          latitude: p.latitude ?? "",
          longitude: p.longitude ?? "",
          area_sqm: p.area_sqm ?? "",
          type: p.type || "urban",
          purchase_price: p.purchase_price ?? "",
          purchase_date: p.purchase_date || "",
          legal_status: p.legal_status || "pending",
          general_status: p.general_status || "active",
          notes: p.notes || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : 0,
    };

    if (isEdit) {
      await api.update(id, payload);
    } else {
      await api.create(payload);
    }
    navigate("/properties");
  };

  if (loading) return <div className="p-8 text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? "Editar Propiedad" : "Nueva Propiedad"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input name="name" value={form.name} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input name="address" value={form.address} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
            <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
            <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área (m²)</label>
            <input name="area_sqm" type="number" value={form.area_sqm} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select name="type" value={form.type} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="urban">Urbano</option>
              <option value="rural">Rural</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Compra</label>
            <input name="purchase_price" type="number" value={form.purchase_price} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra</label>
            <input name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado General</label>
            <select name="general_status" value={form.general_status} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="active">Activo</option>
              <option value="for_sale">En Venta</option>
              <option value="rented">Alquilado</option>
              <option value="construction">En Construcción</option>
              <option value="abandoned">Abandonado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Legal</label>
            <select name="legal_status" value={form.legal_status} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="pending">Pendiente</option>
              <option value="ok">OK</option>
              <option value="in_process">En Proceso</option>
              <option value="observed">Observado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
            {isEdit ? "Guardar Cambios" : "Crear Propiedad"}
          </button>
          <button type="button" onClick={() => navigate("/properties")}
            className="text-gray-600 px-6 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
